# package-json-version-tool
simple package.json version tool

# Install

```
npm install package-json-version-tool
```

# Usage & Api

```javascript

var vt = require("package-json-version-tool");

//.parseVersion(versionString)		//return versionArray
JSON.stringify(vt.parseVersion("v0.1.2")) === JSON.stringify([0, 1, 2]) &&
JSON.stringify(vt.parseVersion("0.1.2-asdf")) === JSON.stringify([0, 1, 2, "-asdf"]);

var cmp = function (value, expect) {
	if (JSON.stringify(value) === JSON.stringify(expect)) return true;
	return false;
}

//.parseRange(rangeString)		//return an array of rangePair, that is [ rangePair1, rangePair2, ... ]
cmp(vt.parseRange("1.2.3 - 2.3.4"), [[[1, 2, 3, , true], [2, 3, 5, , ,]]]) &&
cmp(vt.parseRange("<1.2.3"), [[[0, 0, 0, , true], [1, 2, 3, , ,]]]);

//.satisfy(version, range)
vt.satisfy("1.2.7", " 1.2.7 || >=1.2.9 <2.0.0 ") === true &&
vt.satisfy("1.2.8", " 1.2.7 || >=1.2.9 <2.0.0 ") === false;

//.sameRange(range1, range2)		//check if 2 ranges are same
vt.sameRange("1.2.3 - 2.3.4", ">=1.2.3 <=2.3.4") &&
vt.sameRange("1.2 - 2.3.4", ">=1.2.0 <=2.3.4");

```

# Definition
```
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
```
