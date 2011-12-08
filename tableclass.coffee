#you can set different options on start up
options =
	hiddenClass: 'hidden'
	equalityComparator: 'ignoreCase'
	inequalityComparator: 'easy'

#the equality comparators, that will be used most of the time
equalityComparators =
	#true if value matches query ignoring the case ('Hello' = 'HeLlO')
	ignoreCase: (query, value) ->
		query = query.toLowerCase()
		value = value.toLowerCase()
		return ~value.indexOf(query)
	#true if value matches query, case-sensitive ('Hello' != 'hello')
	useCase: (query, value) ->
		return ~value.indexOf(query)
		
#this will be used if you use an inequality comparison, like: '>', '<' 
inequalityComparators =
	easy: (query, value) ->
		return value > query

#returns the right comparator
choose_comparator = (inequality) ->
	switch inequality
		when '>' then return options.inequalityComparator
		when '>='
			return (query, value) ->
				return (options.inequalityComparator(query, value) or options.equalityComparator(query, value))
		when '<'
			return (query, value) ->
				return not (options.inequalityComparator(query, value) or options.equalityComparator(query, value))
		when '<='
			return (query, value) ->
				return not options.inequalityComparator(query, value)
		else return options.equalityComparator
	
search_in_element = (term, $row, additional_data) ->
	query = term.value
	label = term.name
	
	$element = $row.find('.'+label)

	if $element.length
		value = $element.attr('data-value')

		value = if value then value else $element.text()

	else
		value = additional_data[label]
		if not value?
			value = ''
	
	if not term.comparator?
		comparator = choose_comparator(term.inequality)
		term.comparator = comparator

	return term.comparator(query, value)

search_in_row = (term, $row) ->
	query = term.value
	value = $row.text()
	
	return options.equalityComparator(query, value)

search_and = (terms, $row) ->
	additional_data = $row.attr('data-additional-data')
	additional_data = JSON.parse(additional_data)

	for term in terms

		if not term.operation?

			if term.whole_row
				if not search_in_row(term, $row, additional_data)
					return false
			else
				if not search_in_element(term, $row, additional_data)
					return false

		else
			branch_passed = choose_op(term, $row)
			if not branch_passed
				return false

	return true

search_or = (terms, $row) ->
	additional_data = $row.attr('data-additional-data')
	additional_data = JSON.parse(additional_data)

	for term in terms

		if not term.operation?

			if term.whole_row
				if search_in_row(term, $row, additional_data)
					return true
			else
				if search_in_element(term, $row, additional_data)
					return true
		else
			branch_passed = choose_op(term, $row)
			if branch_passed
				return true

	return false

choose_op = (parameter, $row) ->
	switch parameter.operation
		when 'and' then return search_and(parameter.terms, $row)
		when 'or' then return search_or(parameter.terms, $row)

class TableClass
	@VERSION: '0.0.1'
	equalityComparators: equalityComparators
	inequalityComparators: inequalityComparators
	constructor: (@$table, opt) ->
		options = $.extend(options, opt)
		@$rows = @$table.find('tbody tr')

		@setEqualityComparator options.equalityComparator
		@setInequalityComparator options.inequalityComparator


	setEqualityComparator: (comparator) ->
		type = Object.prototype.toString.call(comparator)
		if type is '[object String]'
			options.equalityComparator = @equalityComparators[comparator]
		else
			options.equalityComparator = comparator
		return

	setInequalityComparator: (comparator) ->
		type = Object.prototype.toString.call(comparator)
		if type is '[object String]'
			options.inequalityComparator = @inequalityComparators[comparator]
		else
			options.inequalityComparator = comparator
		return

	search: (searchparams) ->

		@$rows.detach()

		@$rows.removeClass(options.hiddenClass)

		if not searchparams?.terms?.length
			@$table.find('tbody').append(@$rows)
			return

		for row in @$rows
			$row = $(row)

			passed = choose_op(searchparams, $row)

			if not passed
				$row.addClass(options.hiddenClass)

		@$table.find('tbody').append(@$rows)

		return


exports = this
exports.TableClass = TableClass