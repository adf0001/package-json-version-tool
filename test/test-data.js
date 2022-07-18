
//global variable, for html page, refer tpsvr @ npm.
vt = require("../package-json-version-tool.js");

module.exports = {

	".parseVersion()": function (done) {

		//console.log( JSON.stringify(vt.parseVersion("v0.2.3")) );

		done(!(
			//.parseVersion(versionString)		//return versionArray
			JSON.stringify(vt.parseVersion("v0.1.2")) === JSON.stringify([0, 1, 2]) &&
			JSON.stringify(vt.parseVersion("0.1.2-asdf")) === JSON.stringify([0, 1, 2, "-asdf"]) &&
			vt.parseVersion("0.01.2-asdf") === null &&
			vt.parseVersion("0.1.alpha-asdf") === null &&
			vt.parseVersion("0.1-asdf") === null &&
			true
		));
	},

	".parseRange()": function (done) {

		var cmp = function (value, expect) {
			if (JSON.stringify(value) === JSON.stringify(expect)) return true;
			console.error("value string: " + JSON.stringify(value));
			console.error("the expected: " + JSON.stringify(expect));
			return false;
		}

		done(!(
			/*
			*/

			//.parseRange(rangeString)		//return an array of rangePair, that is [ rangePair1, rangePair2, ... ]
			cmp(vt.parseRange("1.2.3 - 2.3.4"), [[[1, 2, 3, , true], [2, 3, 5, , ,]]]) &&
			cmp(vt.parseRange("<1.2.3"), [[[0, 0, 0, , true], [1, 2, 3, , ,]]]) &&
			
			cmp(vt.parseRange("<=1.2.3"), [[[0, 0, 0, , true], [1, 2, 4, , ,]]]) &&
			cmp(vt.parseRange("<= 1.2.3"), [[[0, 0, 0, , true], [1, 2, 4, , ,]]]) &&
			
			cmp(vt.parseRange(">1.2.3"), [[[1, 2, 4, , true], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,]]]) &&
			cmp(vt.parseRange(">=1.2.3"), [[[1, 2, 3, , true], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,]]]) &&
			cmp(vt.parseRange("=1.2.3"), [[[1, 2, 3, , true], [1, 2, 4, , ,]]]) &&
			cmp(vt.parseRange("1.2.3"), [[[1, 2, 3, , true], [1, 2, 4, , ,]]]) &&
			cmp(vt.parseRange(">=1.2.7 <1.3.0"), [[[1, 2, 7, , true], [1, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("<1.2.7 >=1.3.0"), [[[1, 3, 0, , true], [1, 2, 7, , ,]]]) &&
			cmp(vt.parseRange(" 1.2.7 || >=1.2.9 <2.0.0 "), [[[1, 2, 7, , true], [1, 2, 8, , ,]], [[1, 2, 9, , true], [2, 0, 0, , ,]]]) &&

			cmp(vt.parseRange("*"), [[[0, 0, 0, , true], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,]]]) &&
			cmp(vt.parseRange("1.x"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("1.2.x"), [[[1, 2, 0, , true], [1, 3, 0, , ,]]]) &&
			cmp(vt.parseRange(""), [[[0, 0, 0, , true], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,]]]) &&
			cmp(vt.parseRange("1"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("1.x.x"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange(" 1.x.x "), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("1.2"), [[[1, 2, 0, , true], [1, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("1.2.x"), [[[1, 2, 0, , true], [1, 3, 0, , ,]]]) &&

			cmp(vt.parseRange("1.*.7"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("X"), [[[0, 0, 0, , true], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, , ,]]]) &&

			cmp(vt.parseRange(" "), null) &&
			cmp(vt.parseRange(null), null) &&
			cmp(vt.parseRange(), null) &&
			cmp(vt.parseRange({}), null) &&

			cmp(vt.parseRange("~1.2.3"), [[[1, 2, 3, , true], [1, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("~1.2"), [[[1, 2, 0, , true], [1, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("~1"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("~0.2.3"), [[[0, 2, 3, , true], [0, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("~0.2"), [[[0, 2, 0, , true], [0, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("~0"), [[[0, 0, 0, , true], [1, 0, 0, , ,]]]) &&

			cmp(vt.parseRange("^1.2.3"), [[[1, 2, 3, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("^0.2.3"), [[[0, 2, 3, , true], [0, 3, 0, , ,]]]) &&
			cmp(vt.parseRange("^0.0.3"), [[[0, 0, 3, , true], [0, 0, 4, , ,]]]) &&

			cmp(vt.parseRange("^1.2.x"), [[[1, 2, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("^0.0.x"), [[[0, 0, 0, , true], [0, 1, 0, , ,]]]) &&
			cmp(vt.parseRange("^0.0"), [[[0, 0, 0, , true], [0, 1, 0, , ,]]]) &&

			cmp(vt.parseRange("^1.x"), [[[1, 0, 0, , true], [2, 0, 0, , ,]]]) &&
			cmp(vt.parseRange("^0.x"), [[[0, 0, 0, , true], [1, 0, 0, , ,]]]) &&
			/*
			*/

			true
		));
	},

	".satisfy()": function (done) {
		done(!(
			//.satisfy(version, range)
			vt.satisfy("1.2.7", " 1.2.7 || >=1.2.9 <2.0.0 ") === true &&
			vt.satisfy("1.2.9", " 1.2.7 || >=1.2.9 <2.0.0 ") === true &&
			vt.satisfy("1.4.6", " 1.2.7 || >=1.2.9 <2.0.0 ") === true &&
			vt.satisfy("1.2.8", " 1.2.7 || >=1.2.9 <2.0.0 ") === false &&
			vt.satisfy("2.0.0", " 1.2.7 || >=1.2.9 <2.0.0 ") === false &&
			vt.satisfy("2.0.0", " gsdfgsdfg ") === null &&
			vt.satisfy("gregsr", " 1.2.7 || >=1.2.9 <2.0.0 ") === null &&
			
			vt.satisfy("1.0.1", ">= 1.0.0") === true &&
			
			true
		));
	},

	".sameRange()": function (done) {
		var chk = function (r1, r2, r3) {
			//.sameRange(range1, range2)		//check if 2 ranges are same
			if (vt.sameRange(r1, r2)) {
				if (typeof r3 === "undefined") return true;

				if (vt.sameRange(r2, r3)) return true;

				console.error("r2: " + JSON.stringify(vt.parseRange(r2)) + ",\t\t" + r2);
				console.error("r3: " + JSON.stringify(vt.parseRange(r3)) + ",\t\t" + r3);
				return false;
			}
			console.error("r1: " + JSON.stringify(vt.parseRange(r1)) + ",\t\t" + r1);
			console.error("r2: " + JSON.stringify(vt.parseRange(r2)) + ",\t\t" + r2);
			return false;
		}
		done(!(
			//refer npm-semver
			chk("1.2.3 - 2.3.4", ">=1.2.3 <=2.3.4") &&
			chk("1.2 - 2.3.4", ">=1.2.0 <=2.3.4") &&
			chk("1.2.3 - 2.3 ", " >=1.2.3 <2.4.0") &&
			chk("1.2.3 - 2 ", " >=1.2.3 <3.0.0") &&
			chk("* ", " >=0.0.0") &&
			chk("1.x ", " >=1.0.0 <2.0.0") &&
			chk("1.2.x ", " >=1.2.0 <1.3.0") &&
			chk("", "*", ">=0.0.0") &&
			chk("1 ", " 1.x.x ", " >=1.0.0 <2.0.0") &&
			chk("1.2 ", " 1.2.x", ">=1.2.0 <1.3.0") &&
			chk("~1.2.3 ", " >=1.2.3 <1.3.0") &&
			chk("~1.2", " >=1.2.0 <1.3.0 ", "1.2.x") &&
			chk("~1", " >=1.0.0 <2.0.0 ", " 1.x") &&
			chk("~0.2.3 ", " >=0.2.3 <0.3.0") &&
			chk("~0.2 ", " >=0.2.0 <0.3.0 ", " 0.2.x") &&
			chk("~0 ", " >=0.0.0 <1.0.0 ", " 0.x") &&
			chk("^1.2.3 ", " >=1.2.3 <2.0.0") &&
			chk("^0.2.3 ", " >=0.2.3 <0.3.0") &&
			chk("^0.0.3 ", " >=0.0.3 <0.0.4") &&
			chk("^1.2.x ", " >=1.2.0 <2.0.0") &&
			chk("^0.0.x ", " >=0.0.0 <0.1.0") &&
			chk("^0.0 ", " >=0.0.0 <0.1.0") &&
			chk("^1.x ", " >=1.0.0 <2.0.0") &&
			chk("^0.x ", " >=0.0.0 <1.0.0") &&
			true
		));
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('package_json_version_tool', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
