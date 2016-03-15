function isUndef(value) {
	'use strict';

	return typeof value === 'undefined';
}

function isString(value) {
	'use strict';

	return typeof value === 'string';
}

function isArray(value) {
	'use strict';

	return Array.isArray(value);
}

function toArray(value) {
	'use strict';

	return isArray(value) ? value : [value];
}

function getValue(obj, name) {
	'use strict';

	return name.split('.').reduce(function (accu, value) {
		if (isUndef(accu)) {
			return;
		}

		return accu[value];
	}, obj);
}

function setValue(obj, name, value) {
	'use strict';

	var nameArr = name.split('.'),
		nameArrLen = nameArr.length,
		lastIndex = nameArrLen - 1;

	nameArr.reduce(function (accu, key, index) {
		if (index === lastIndex) {
			accu[key] = value;
		} else if (isUndef(accu[key])) {
			accu[key] = Object.create(null);
		}

		return accu[key];
	}, obj);
}

function validateValue(Scheme, value) {
	'use strict';

	var isValid = false;

	if (Scheme === Object) {
		isValid = typeof value === 'object';
	} else if (Scheme === Date) {
		isValid = !isNaN(value.getTime());
	} else {
		isValid = true;
	}

	return isValid;
}

function applyScheme(Scheme, value) {
	'use strict';

	var output;

	if (isUndef(Scheme)) {
		output = value;
	} else if (!isUndef(value)) {
		if (Scheme === Date) {
			output = new Scheme(value);
		} else if (Scheme === Array)  {
			// how should handle arrays?
			output = toArray(value);
		} else if (Scheme === Object) {
			if (isString(value)) {
				output = JSON.parse(value);
			} else {
				output = Scheme(value);
			}
		} else if (isArray(Scheme)) {
			output = toArray(value).map(function (i) {
				return applyScheme(Scheme[0], i);
			});
		} else if (typeof Scheme === 'object') {
			output = Object.keys(Scheme).reduce(function (accu, key) {
				accu[key] = applyScheme(Scheme[key], value[key]);
				return accu;
			}, {});
		} else {
			output = Scheme(value).valueOf();
		}
	}

	return output;
}

var model = {

	// {
	// 	str: String,
	// 	num: Number,
	// 	date: Date,
	// 	bool: Boolean,
	// 	arr: Array,
	// 	obj: Object,
	// }
	scheme: Object.create(null),

	data: Object.create(null),

	set: function (name, value) {
		'use strict';

		setValue(this.data, name, value);
	},

	get: function (name) {
		'use strict';

		var value, Scheme, output;

		value = getValue(this.data, name);
		Scheme = getValue(this.scheme, name);

		output = applyScheme(Scheme, value);

		if (this.validateScheme && !validateValue(Scheme, output)) {
			throw new TypeError(output + ' is not an instance of ' + Scheme);
		}

		return output;
	}
};

module.exports = model;
