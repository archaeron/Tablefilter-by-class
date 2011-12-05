
options =
	hiddenClass: 'hidden'

search_in_element = (query, $elem) ->
	value = $elem.attr('data-value')

	value = if value then value else $elem.text()
	
	value = value.toLowerCase()
	query = query.toLowerCase()

	return value.indexOf(query) > -1

search_in_row = (query, $row) ->
	to_search = $row.text().toLowerCase();
	query = query.toLowerCase();
	return to_search.indexOf(query) > -1

search_and = (terms, $row) ->

	for term in terms

		if not term.operation?
			$element = $row.find('.'+term.name)

			if term.whole_row
				if not search_in_row(term.value, $row)
					return false
			else
				if not search_in_element(term.value, $element)
					return false

		else
			passed_branch = choose_op(term, $row)
			if not passed_branch
				return false;

	return true;

choose_op = (parameter, $row) ->
	switch parameter.operation
		when 'and' then return search_and(parameter.terms, $row)
		when 'or' then #TODO return search_or(parameter.terms, $row)

class TableClass
	@VERSION: '0.0.1'
	constructor: ($table, opt) ->

		@$rows = $table.find('tbody tr')

	search: (searchparams) ->

		@$rows.removeClass(options.hiddenClass)

		if not searchparams?.terms?.length
			console.log('aborting, no params')
			return

		for row in @$rows
			$row = $(row)

			passed = choose_op(searchparams, $row)

			if not passed
				$row.addClass(options.hiddenClass)

		return


exports = this
exports.TableClass = TableClass