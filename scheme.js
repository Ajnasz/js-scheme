/**
 * Determines wheter the passed value is undefined
 * @private
 * @param {*} value
 * @return {Boolean}
 */
function isUndef(value) {
	'use strict';

	return typeof value === 'undefined';
}

/**
 * Determines wheter the passed value is an array
 * @private
 * @param {*} value Variable to check if defined
 * @return {Boolean}
 */
function isArray(value) {
	'use strict';

	return Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * Returns the assigned value in an object, where in the name keys are separated by .
 * @private
 * @param {Object} obj Object where need to find for the property
 * @param {String} name Name of the property, sub keys separated by '.'
 * @return {*}
 */
function getValue(obj, name) {
	'use strict';

	return name.split('.').reduce(function getValueReduce(accu, value) {
		if (isUndef(accu)) {
			return;
		}

		return accu[value];
	}, obj);
}

/**
 * Sets the value in the obj, sub objects can be separated by .
 * @private
 * @param {Object} obj Object where the property must be set
 * @param {String} name Name of the property, sub keys separated by '.'
 * @param {*} value The new value
 */
function setValue(obj, name, value) {
	'use strict';

	var nameArr = name.split('.'),
		nameArrLen = nameArr.length,
		lastIndex = nameArrLen - 1;

	nameArr.reduce(function setValueReduce(accu, key, index) {
		if (index === lastIndex) {
			accu[key] = value;
		} else if (isUndef(accu[key])) {
			accu[key] = Object.create(null);
		}

		return accu[key];
	}, obj);
}

/**
 * Returns true if the passed value is a valid representation of the given scheme
 * Will be false if it's an invalid date or a 'NaN'
 * @private
 * @param {*} scheme Scheme descriptor, mostly a primitve (Date, Number, String, Boolean)
 * @param {*} value The value to validate
 * @return {Boolean}
 */
function validateValue(scheme, value) {
	'use strict';

	var isValid = true;

	if (scheme === Date) {
		isValid = !isNaN(value.getTime());
	} else if (scheme === Number) {
		isValid = !isNaN(value);
	}

	return isValid;
}

function applyArrayScheme(scheme, value) {
	'use strict';

	var arrayScheme = scheme[0];

	return value.map(function (i) {
		return applyScheme(arrayScheme, i);
	});
}

function applyObjectScheme(scheme, value) {
	'use strict';

	return Object.keys(scheme).reduce(function objectSchemeReduce(accu, key) {
		if (!isUndef(value[key])) {
			accu[key] = applyScheme(scheme[key], value[key]);
		}

		return accu;
	}, Object.create(null));
}

/**
 * Casts the value to the passed scheme type
 * @private
 * @param {*} scheme Scheme descriptor, mostly a primitve (Date, Number, String, Boolean)
 * @param {*} value The value to cast
 * @return {*}
 */
function applyScheme(scheme, value) {
	'use strict';

	var output;

	if (typeof scheme === 'object') {
		if (isArray(scheme)) {
			output = applyArrayScheme(scheme, value);
		} else {
			output = applyObjectScheme(scheme, value);
		}
	} else if (scheme === Date) {
		output = new Date(value);
	} else {
		output = scheme(value).valueOf();
	}

	return output;
}

/**
 * Fills up the data object with falsy values based on the scheme
 * @private
 * @param {Object} scheme
 * @param {Object} data
 */
function fillUp(scheme, data) {
	'use strict';

	Object.keys(scheme).forEach(function (key) {
		if (typeof scheme[key] === 'object') {
			if (isArray(scheme[key])) {
				data[key] = [];
			} else {
				data[key] = Object.create(null);
				fillUp(scheme[key], data[key]);
			}
		} else if (scheme[key] === Date) {
			data[key] = 0;
		} else {
			data[key] = scheme[key]('').valueOf();
		}
	});
}

/**
 * Model with scheme capabilities
 * <pre>
 * var m = Object.create(model)
 * m.data = Object.create(null);
 * m.scheme = {
 *	num: Number,
 *	str: String,
 *	bool: Boolean,
 *	date: Date,
 *	stringArr: [String],
 *	numberArr: [Number],
 *	deeper: {
 *		num: Number
 *	}
 * };
 * m.set('num', '1234');
 * m.get('num'); // 1234</pre>
 * @exports model
 * @property {Object} data Stores the data
 * @property {Object} scheme Describes the scheme of data
 * @property {Boolean} validateScheme throw error if a scheme couldn't cast a value
 */
var model = {

	scheme: Object.create(null),

	validateScheme: true,

	data: null,

	/**
	 * Sets value to the model
	 * @param {String} name The name of the property, sub keys separated by '.'
	 * @param {*} value The value of the property
	 */
	set: function set(name, value) {
		'use strict';

		setValue(this.data, name, value);
	},

	/**
	 * Returns the value assigned to the key
	 * @param {String} name The name of the property, sub keys separated by '.'
	 * @return {*}
	 */
	get: function get(name) {
		'use strict';
		var value, scheme, output;

		value = getValue(this.data, name);
		scheme = getValue(this.scheme, name);

		if (isUndef(scheme) || isUndef(value)) {
			return value;
		}

		output = applyScheme(scheme, value);

		if (this.validateScheme && !validateValue(scheme, output)) {
			throw new TypeError(output + ' is not an instance of ' + scheme);
		}

		return output;
	},

	init: function init() {
		'use strict';

		var data = Object.create(null);

		if (this.scheme) {
			fillUp(this.scheme, data);
		}

		this.data = data;
	}

};

function Model(scheme) {
	'use strict';

	this.scheme = scheme;
	this.init();
}

Model.prototype = model;

module.exports = Model;
