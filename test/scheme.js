var model = require('../scheme');
var assert = require('assert');


suite('shceme.js', function () {
	'use strict';

	var aModel;

	setup(function () {
		aModel = Object.create(model);

		aModel.scheme = {
			str: String,
			num: Number,
			bool: Boolean,
			date: Date,
			stringArr: [String],
			numberArr: [Number],
			deepObject: {
				num: Number,
				str: String,
				arr: [String],
				more: {
					bool: Boolean
				}
			}
		};
	});

	teardown(function () {
		aModel = null;
	});

	suite('get undefined value', function () {
		test('str should be undefined', function () {
			var undef;
			assert.strictEqual(aModel.get('str'), undef);
		});
	});

	suite('get value without scheme', function () {
		test('unkown should not change', function () {
			aModel.set('unknown', 123);
			assert.strictEqual(aModel.get('unknown'), 123);
		});
	});

	suite('get value with scheme', function () {
		test('string', function () {
			aModel.set('str', 123);
			assert.strictEqual(aModel.get('str'), '123');
			assert.strictEqual(typeof aModel.get('str'), 'string');
		});

		test('number', function () {
			aModel.set('num', '123');
			assert.strictEqual(aModel.get('num'), 123);
			assert.strictEqual(typeof aModel.get('num'), 'number');
		});

		test('boolean', function () {
			aModel.set('bool', '1');
			assert.strictEqual(aModel.get('bool'), true);
			assert.strictEqual(typeof aModel.get('bool'), 'boolean');
		});

		test('date', function () {
			aModel.set('date', '2016-03-15T12:39:38.065Z');
			assert(aModel.get('date') instanceof Date);
			assert.equal(aModel.get('date').getTime(), 1458045578065);
		});

	});

	suite('array of values', function () {
		suite('string array', function () {
			test('Should convert all values to string', function () {
				aModel.set('stringArr', ['foobar', 123, null]);
				assert.deepStrictEqual(aModel.get('stringArr'), ['foobar', '123', 'null']);
			});
		});
		suite('number array', function () {
			test('Should convert all values to number', function () {
				aModel.set('numberArr', ['123', null, '1234.123']);
				assert.deepStrictEqual(aModel.get('numberArr'), [123, 0, 1234.123]);
			});
		});
	});

	suite('deep object', function () {
		test('casting object properties', function () {
			aModel.set('deepObject', {
				num: '1234',
				str: 1234,
				arr: [999],
				more: {
					bool: 0
				}
			});

			assert.deepStrictEqual(aModel.get('deepObject'), {
				num: 1234,
				str: '1234',
				arr: ['999'],
				more: {
					bool: false
				}
			});
		});
	});
});
