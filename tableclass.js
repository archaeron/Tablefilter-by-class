(function() {
  var TableClass, choose_op, exports, options, search_and, search_in_element, search_in_row;

  options = {
    hiddenClass: 'hidden'
  };

  search_in_element = function(query, label, $row, additional_data) {
    var $element, value;
    $element = $row.find('.' + label);
    if ($element.length) {
      value = $element.attr('data-value');
      value = value ? value : $element.text();
    } else {
      value = additional_data[label];
      if (value === null) value = '';
    }
    value = value.toLowerCase();
    query = query.toLowerCase();
    return value.indexOf(query) > -1;
  };

  search_in_row = function(query, $row) {
    var to_search;
    to_search = $row.text().toLowerCase();
    query = query.toLowerCase();
    return to_search.indexOf(query) > -1;
  };

  search_and = function(terms, $row) {
    var additional_data, passed_branch, term, _i, _len;
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
        passed_branch = choose_op(term, $row);
        if (!passed_branch) return false;
      }
    }
    return true;
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

    function TableClass($table, opt) {
      this.$rows = $table.find('tbody tr');
    }

    TableClass.prototype.search = function(searchparams) {
      var $row, passed, row, _i, _len, _ref, _ref2;
      this.$rows.removeClass(options.hiddenClass);
      if (!(searchparams != null ? (_ref = searchparams.terms) != null ? _ref.length : void 0 : void 0)) {
        return;
      }
      _ref2 = this.$rows;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        row = _ref2[_i];
        $row = $(row);
        passed = choose_op(searchparams, $row);
        if (!passed) $row.addClass(options.hiddenClass);
      }
    };

    return TableClass;

  })();

  exports = this;

  exports.TableClass = TableClass;

}).call(this);
