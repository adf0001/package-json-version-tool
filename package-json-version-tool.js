
// package-json-version-tool @ npm, simple package.json version tool

/*
Definition:

	* versionArray
		[ majorNumber, minorNumber, patchNumber, tail ]

		A version array. The Number here is 0 or positive interger.

	* rangePair / versionRangePair / normalized versionRangePair
		[ versionArrayMin, versionArrayMax ]
			versionArrayMin/Max: [ majorNumber, minorNumber, patchNumber, , included ]

		A version range pair array.
		* the Number here may be Number.MAX_VALUE / 1.7976931348623157e+308
		* a normalized versionRangePair
			* try to add 'included' to versionArrayMin;
			* try to remove Number.MAX_VALUE and 'included' from versionArrayMax;

*/

//const
var INDEX_MAJOR = 0;
var INDEX_MINOR = 1;
var INDEX_PATCH = 2;
var INDEX_TAIL = 3;

var INDEX_INCLUDED = 4;

var RANGE_MIN = 0;
var RANGE_MAX = 1;

//return versionArray
var parseVersion = function (versionString) {
	versionString = versionString.replace(/^(v|\=)/i, "");		//refer npm-semver: A leading "=" or "v" character is stripped off and ignored.

	/*
	refer http://semver.org/.

	<valid semver> ::= <version core>
				 | <version core> "-" <pre-release>
				 | <version core> "+" <build>
				 | <version core> "-" <pre-release> "+" <build>

	<version core> ::= <major> "." <minor> "." <patch>

	<major> ::= <numeric identifier>

	<minor> ::= <numeric identifier>

	<patch> ::= <numeric identifier>
	...
	<numeric identifier> ::= "0"
						| <positive digit>
						| <positive digit> <digits>
	*/

	var m = versionString.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(.*)$/);
	if (!m) return null;

	var va = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
	if (m[4]) va[INDEX_TAIL] = m[4];

	return va;
};

//==============================
// parse range

/*
refer npm-semver

Range Grammar:

range-set  ::= range ( logical-or range ) *
logical-or ::= ( ' ' ) * '||' ( ' ' ) *
range      ::= hyphen | simple ( ' ' simple ) * | ''
hyphen     ::= partial ' - ' partial
simple     ::= primitive | partial | tilde | caret
primitive  ::= ( '<' | '>' | '>=' | '<=' | '=' ) partial
partial    ::= xr ( '.' xr ( '.' xr qualifier ? )? )?
xr         ::= 'x' | 'X' | '*' | nr
nr         ::= '0' | ['1'-'9'] ( ['0'-'9'] ) *
tilde      ::= '~' partial
caret      ::= '^' partial
qualifier  ::= ( '-' pre )? ( '+' build )?
pre        ::= parts
build      ::= parts
parts      ::= part ( '.' part ) *
part       ::= nr | [-0-9A-Za-z]+

it can be simplified as:

range-set  ::= range ( logical-or range ) *		<== .parseRange()
logical-or ::= ( ' ' ) * '||' ( ' ' ) *
range      ::= partial ' - ' partial | simple ( ' ' simple ) * | ''		<== .parseSingleRange()
		//hyphen     ::= partial ' - ' partial
simple     ::= ( '<' | '>' | '>=' | '<=' | '=' |  '~' | '^' )? partial
		//simple     ::= ( '<' | '>' | '>=' | '<=' | '=' ) partial | partial | '~' partial | '^' partial
		//primitive  ::= ( '<' | '>' | '>=' | '<=' | '=' ) partial
partial    ::= xr ( '.' xr ( '.' xr qualifier ? )? )?
xr         ::= 'x' | 'X' | '*' | '0' | ['1'-'9'] ( ['0'-'9'] ) *
		//nr         ::= '0' | ['1'-'9'] ( ['0'-'9'] ) *
		//tilde      ::= '~' partial
		//caret      ::= '^' partial
qualifier  ::= ( '-' parts )? ( '+' parts )?		<== tail, ignored in this lib.
		//pre        ::= parts
		//build      ::= parts
parts      ::= \w+ ( '.' \w+ ) *
		//part       ::= nr | [-0-9A-Za-z]+
		//part       ::= \w+

*/

var _regPartial = /^(x|X|\*|0|[1-9]\d*)(?:\.(x|X|\*|0|[1-9]\d*))?(?:\.(x|X|\*|0|[1-9]\d*))?(.*)/;

var _regSimplePrefix = /^(\>\=|\<\=|\<|\>|\=|\~|\^)/;
var _regSimplePrefixSpaces = /(\>\=|\<\=|\<|\>|\=|\~|\^)\s+/;

var _isX = function (ch) {
	return ch && (ch === "x" || ch === "X" || ch === "*");
}

//return rangePair
var _toRangePair = function (rawVa) {
	var vaMin = [, , , , ,], vaMax = [, , , , ,];

	if (_isX(rawVa[INDEX_MAJOR])) {
		vaMin[INDEX_MAJOR] = vaMin[INDEX_MINOR] = vaMin[INDEX_PATCH] = 0;
		vaMax[INDEX_MAJOR] = vaMax[INDEX_MINOR] = vaMax[INDEX_PATCH] = Number.MAX_VALUE;
	}
	else {
		vaMin[INDEX_MAJOR] = vaMax[INDEX_MAJOR] = parseInt(rawVa[INDEX_MAJOR]);

		if (!rawVa[INDEX_MINOR] || _isX(rawVa[INDEX_MINOR])) {
			vaMin[INDEX_MINOR] = vaMin[INDEX_PATCH] = 0;
			vaMax[INDEX_MINOR] = vaMax[INDEX_PATCH] = Number.MAX_VALUE;
		}
		else {
			vaMin[INDEX_MINOR] = vaMax[INDEX_MINOR] = parseInt(rawVa[INDEX_MINOR]);

			if (!rawVa[INDEX_PATCH] || _isX(rawVa[INDEX_PATCH])) {
				vaMin[INDEX_PATCH] = 0;
				vaMax[INDEX_PATCH] = Number.MAX_VALUE;
			}
			else {
				vaMin[INDEX_PATCH] = vaMax[INDEX_PATCH] = parseInt(rawVa[INDEX_PATCH]);
			}
		}
	}

	return [vaMin, vaMax];
}

var _compareVersionArray = function (va1, va2) {
	if (va1[INDEX_MAJOR] > va2[INDEX_MAJOR]) return 1;
	if (va1[INDEX_MAJOR] < va2[INDEX_MAJOR]) return -1;
	if (va1[INDEX_MINOR] > va2[INDEX_MINOR]) return 1;
	if (va1[INDEX_MINOR] < va2[INDEX_MINOR]) return -1;
	if (va1[INDEX_PATCH] > va2[INDEX_PATCH]) return 1;
	if (va1[INDEX_PATCH] < va2[INDEX_PATCH]) return -1;
	return 0;
}

var _setIncluded = function (va, included) {
	if (included) {
		if (va[INDEX_PATCH] !== Number.MAX_VALUE) va[INDEX_INCLUDED] = true;
	}
	else {
		delete va[INDEX_INCLUDED];
	}
}

var _copyVersionArray = function (src, dest, included) {
	dest[INDEX_MAJOR] = src[INDEX_MAJOR];
	dest[INDEX_MINOR] = src[INDEX_MINOR];
	dest[INDEX_PATCH] = src[INDEX_PATCH];

	if (typeof included !== "undefined") _setIncluded(dest, included);

	return dest;
}

var _intersectVersionArray = function (op, src, dest) {
	var cr = _compareVersionArray(src, dest);

	if (op === "<") {
		if (cr <= 0) {
			_setIncluded(dest, false);
			if (cr < 0) _copyVersionArray(src, dest);
		}
	}
	else if (op === "<=") {
		if (cr < 0) {
			_copyVersionArray(src, dest, true);
		}
	}
	else if (op === ">") {
		if (cr >= 0) {
			_setIncluded(dest, false);
			if (cr > 0) _copyVersionArray(src, dest);
		}
	}
	else if (op === ">=") {
		if (cr > 0) {
			_copyVersionArray(src, dest, true);
		}
	}
	else throw "unkonwn intersect op, " + op;
}

//return rangePair
var normalizeRangePair = function (rangePair) {

	//try to add 'included' to RANGE_MIN
	var va = rangePair[RANGE_MIN];
	if (!va[INDEX_INCLUDED]) {
		_setIncluded(va, true);
		va[INDEX_PATCH]++;
	}

	//try to remove Number.MAX_VALUE and 'included' from RANGE_MAX

	va = rangePair[RANGE_MAX];

	if (va[INDEX_MAJOR] === Number.MAX_VALUE) {
		//for all version, can't be removed.
	}
	else {
		if (va[INDEX_INCLUDED]) {
			_setIncluded(va, false);
			va[INDEX_PATCH]++;
		}
		else {
			if (va[INDEX_PATCH] === Number.MAX_VALUE) {
				va[INDEX_PATCH] = 0;
				va[INDEX_MINOR]++;
			}
			if (va[INDEX_MINOR] === Number.MAX_VALUE) {
				va[INDEX_MINOR] = 0;
				va[INDEX_MAJOR]++;
			}
		}
	}

	return rangePair;
}

/*
parse range string without " || "

return versionRange
*/
var _parseSingleRange = function (singleRange) {
	var sa, m, va, vaMin, vaMax, i, imax;
	if (singleRange.indexOf(" - ") >= 0) {
		//hyphen
		sa = singleRange.split(/\s+\-\s+/);

		m = sa[0].match(_regPartial);
		if (!m) return null;
		vaMin = _toRangePair([m[1], m[2], m[3]])[RANGE_MIN];
		_setIncluded(vaMin, true);

		m = sa[1].match(_regPartial);
		if (!m) return null;
		vaMax = _toRangePair([m[1], m[2], m[3]])[RANGE_MAX];
		_setIncluded(vaMax, true);

		return normalizeRangePair([vaMin, vaMax]);
	}

	//simples
	sa = singleRange.replace(/(^\s+|\s+$)/g, "")
		.replace(_regSimplePrefixSpaces,"$1")
		.split(/\s+/);

	vaMin = [0, 0, 0, , true];
	vaMax = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,];

	var prefix, partial;

	imax = sa.length;
	for (i = 0; i < imax; i++) {
		m = sa[i].match(_regSimplePrefix);
		prefix = m && m[0];

		partial = prefix ? sa[i].slice(prefix.length) : sa[i];
		m = partial.match(_regPartial);
		if (!m) return null;
		va = _toRangePair([m[1], m[2], m[3]]);

		if (prefix === "<" || prefix === "<=") {
			_intersectVersionArray(prefix, va[RANGE_MIN], vaMax);
		}
		else if (prefix === ">" || prefix === ">=") {
			_intersectVersionArray(prefix, va[RANGE_MAX], vaMin);
		}
		else if (prefix === "=" || !prefix) {	//refer npm-semver: = Equal. If no operator is specified, then equality is assumed, so this operator is optional, but MAY be included.
			_intersectVersionArray(">=", va[RANGE_MIN], vaMin);
			_intersectVersionArray("<=", va[RANGE_MAX], vaMax);

		}
		else if (prefix === "~") {
			/*
			refer npm-semver:
				Tilde Ranges
					Allows patch-level changes if a minor version is specified on the comparator.
					Allows minor-level changes if not.
			*/
			if (va[RANGE_MAX][INDEX_MINOR] !== Number.MAX_VALUE) {
				va[RANGE_MAX][INDEX_PATCH] = Number.MAX_VALUE;
				_setIncluded(va[RANGE_MAX], false);
			}
			else {
				va[RANGE_MAX][INDEX_MINOR] = va[RANGE_MAX][INDEX_PATCH] = Number.MAX_VALUE
				_setIncluded(va[RANGE_MAX], false);
			}
			_intersectVersionArray(">=", va[RANGE_MIN], vaMin);
			_intersectVersionArray("<=", va[RANGE_MAX], vaMax);
		}
		else if (prefix === "^") {
			/*
			refer npm-semver:
				Caret Ranges
					Allows changes that do not modify the left-most non-zero digit in the [major, minor, patch] tuple.
			*/
			if (va[RANGE_MAX][INDEX_MAJOR] !== Number.MAX_VALUE) {
				if (va[RANGE_MAX][INDEX_MAJOR] > 0) {
					va[RANGE_MAX][INDEX_MINOR] = va[RANGE_MAX][INDEX_PATCH] = Number.MAX_VALUE
					_setIncluded(va[RANGE_MAX], false);
				}
				else if (va[RANGE_MAX][INDEX_MINOR] !== Number.MAX_VALUE) {
					if (va[RANGE_MAX][INDEX_MINOR] > 0) {
						va[RANGE_MAX][INDEX_PATCH] = Number.MAX_VALUE;
						_setIncluded(va[RANGE_MAX], false);
					}
				}
			}

			_intersectVersionArray(">=", va[RANGE_MIN], vaMin);
			_intersectVersionArray("<=", va[RANGE_MAX], vaMax);
		}
		else throw "unkonwn prefix, " + prefix;
	}

	return normalizeRangePair([vaMin, vaMax]);
}

//return an array of rangePair, that is [ rangePair1, rangePair2, ... ]
var parseRange = function (rangeString) {
	if (typeof rangeString !== "string") return null;

	if (rangeString === "") rangeString = "*";	//refer npm-semver: "" (empty string) := * := >=0.0.0

	var sa = rangeString.split(/\s*\|\|\s*/);

	var i, imax = sa.length, r, ra = [];
	for (i = 0; i < imax; i++) {
		r = _parseSingleRange(sa[i])
		if (!r) {
			console.log("parseRange fail at: " + sa[i]);
			return null;
		}
		ra[i] = r;
	}
	return ra;
}

var satisfy = function (version, range) {
	if (typeof version === "string") {
		version = parseVersion(version);
		if (!version) return null;
	}

	if (typeof range === "string") {
		range = parseRange(range);
		if (!range) return null;
	}

	var i, imax = range.length, ri, cr;
	for (i = 0; i < imax; i++) {
		ri = range[i];

		cr = _compareVersionArray(ri[RANGE_MIN], version);
		if (cr > 0 || (cr == 0 && !ri[RANGE_MIN][INDEX_INCLUDED])) continue;

		cr = _compareVersionArray(version, ri[RANGE_MAX]);
		if (cr > 0 || (cr == 0 && !ri[RANGE_MAX][INDEX_INCLUDED])) continue;

		return true;
	}

	return false;
}

//check if 2 ranges are same
var sameRange = function (range1, range2) {
	if (typeof range1 === "string") {
		range1 = parseRange(range1);
		if (!range1) return null;
	}
	if (typeof range2 === "string") {
		range2 = parseRange(range2);
		if (!range2) return null;
	}
	return JSON.stringify(range1) === JSON.stringify(range2);
}

//module

module.exports = {
	INDEX_MAJOR: INDEX_MAJOR,
	INDEX_MINOR: INDEX_MINOR,
	INDEX_PATCH: INDEX_PATCH,
	INDEX_TAIL: INDEX_TAIL,
	INDEX_INCLUDED: INDEX_INCLUDED,

	RANGE_MIN: RANGE_MIN,
	RANGE_MAX: RANGE_MAX,

	parseVersion: parseVersion,

	parseRange: parseRange,

	normalizeRangePair: normalizeRangePair,
	normalize: normalizeRangePair,	//shortcut

	satisfy: satisfy,
	sameRange: sameRange,

};
