(function() {
  var TableClass, choose_op, equalityComparators, exports, options, search_and, search_in_element, search_in_row, search_or;

  options = {
    hiddenClass: 'hidden',
    equalityComparator: 'ignoreCase'
  };

  equalityComparators = {
    ignoreCase: function(query, value) {
      query = query.toLowerCase();
      value = value.toLowerCase();
      return value.indexOf(query) > -1;
    },
    useCase: function(query, value) {
      return value.indexOf(query) > -1;
    }
  };

  search_in_element = function(query, label, $row, additional_data) {
    var $element, value;
    $element = $row.find('.' + label);
    if ($element.length) {
      value = $element.attr('data-value');
      value = value ? value : $element.text();
    } else {
      value = additional_data[label];
      if (!(value != null)) value = '';
    }
    return options.equalityComparator(query, value);
  };

  search_in_row = function(query, $row) {
    var value;
    value = $row.text();
    return options.equalityComparator(query, value);
  };

  search_and = function(terms, $row) {
    var additional_data, branch_passed, term, _i, _len;
    additional_data = $row.attr('data-additional-data');
    additional_data = JSON.parse(additional_data);
    for (_i = 0, _len = terms.length; _i < _len; _i++) {
      term = terms[_i];
      if (!(term.operation != null)) {
        if (term.whole_row) {
          if (!search_in_row(term.value, $row, additional_data)) return false;
        } else {
          if (!search_in_element(term.value, term.name, $row, additional_data)) {
            return false;
          }
        }
      } else {
        branch_passed = choose_op(term, $row);
        if (!branch_passed) return false;
      }
    }
    return true;
  };

  search_or = function(terms, $row) {
    var additional_data, branch_passed, term, _i, _len;
    additional_data = $row.attr('data-additional-data');
    additional_data = JSON.parse(additional_data);
    for (_i = 0, _len = terms.length; _i < _len; _i++) {
      term = terms[_i];
      if (!(term.operation != null)) {
        if (term.whole_row) {
          if (search_in_row(term.value, $row, additional_data)) return true;
        } else {
          if (search_in_element(term.value, term.name, $row, additional_data)) {
            return true;
          }
        }
      } else {
        branch_passed = choose_op(term, $row);
        if (branch_passed) return true;
      }
    }
    return false;
  };

  choose_op = function(parameter, $row) {
    switch (parameter.operation) {
      case 'and':
        return search_and(parameter.terms, $row);
      case 'or':
    }
  };

  TableClass = (function() {

    TableClass.VERSION = '0.0.1';

    TableClass.prototype.equalityComparators = equalityComparators;

    function TableClass($table, opt) {
      this.$table = $table;
      options = $.extend(options, opt);
      this.$rows = this.$table.find('tbody tr');
      this.setEqualityComparator(options.equalityComparator);
    }

    TableClass.prototype.setEqualityComparator = function(comparator) {
      var type;
      type = Object.prototype.toString.call(comparator);
      if (type === '[object String]') {
        options.equalityComparator = this.equalityComparators[comparator];
      } else {
        options.equalityComparator = comparator;
      }
    };

    TableClass.prototype.search = function(searchparams) {
      var $row, passed, row, _i, _len, _ref, _ref2;
      this.$rows.detach();
      this.$rows.removeClass(options.hiddenClass);
      if (!(searchparams != null ? (_ref = searchparams.terms) != null ? _ref.length : void 0 : void 0)) {
        this.$table.find('tbody').append(this.$rows);
        return;
      }
      _ref2 = this.$rows;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        $row = $(row);
        passed = choose_op(searchparams, $row);
        if (!passed) $row.addClass(options.hiddenClass);
      }
      this.$table.find('tbody').append(this.$rows);
    };

    return TableClass;

  })();

  exports = this;

  exports.TableClass = TableClass;

}).call(this);
