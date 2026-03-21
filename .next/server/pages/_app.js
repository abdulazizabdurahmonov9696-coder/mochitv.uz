"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ \"next/head\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @supabase/supabase-js */ \"@supabase/supabase-js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_3__]);\n_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// pages/_app.js\n\n\n\n\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_3__.createClient)(\"https://qjpqwhwbdpdymxmtaoui.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcHF3aHdiZHBkeW14bXRhb3VpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc1OTU4NSwiZXhwIjoyMDgwMzM1NTg1fQ.y07XZmhyFYalS_u9LgySm-88CPuH9P9BzWyVwdRwyeM\");\n// last_seen ni yangilash\nasync function updateLastSeen(userId) {\n    await supabase.from(\"users\").update({\n        last_seen: new Date().toISOString()\n    }).eq(\"id\", userId);\n}\nfunction App({ Component, pageProps }) {\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // LocalStorage dan userni olish\n        const raw = localStorage.getItem(\"anime_user\");\n        if (!raw) return;\n        let user;\n        try {\n            user = JSON.parse(raw);\n        } catch  {\n            return;\n        }\n        if (!user?.id) return;\n        // Sahifa ochilganda darhol yangilash\n        updateLastSeen(user.id);\n        // Har 3 daqiqada bir yangilab turish (faol bo'lsa)\n        const interval = setInterval(()=>{\n            updateLastSeen(user.id);\n        }, 3 * 60 * 1000); // 3 daqiqa\n        // Sichqoncha / klaviatura harakatida ham yangilash\n        const handleActivity = ()=>updateLastSeen(user.id);\n        window.addEventListener(\"mousemove\", handleActivity, {\n            passive: true\n        });\n        window.addEventListener(\"keydown\", handleActivity, {\n            passive: true\n        });\n        window.addEventListener(\"touchstart\", handleActivity, {\n            passive: true\n        });\n        // Sahifa yopilganda ham oxirgi marta yozish\n        const handleUnload = ()=>updateLastSeen(user.id);\n        window.addEventListener(\"beforeunload\", handleUnload);\n        return ()=>{\n            clearInterval(interval);\n            window.removeEventListener(\"mousemove\", handleActivity);\n            window.removeEventListener(\"keydown\", handleActivity);\n            window.removeEventListener(\"touchstart\", handleActivity);\n            window.removeEventListener(\"beforeunload\", handleUnload);\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_2___default()), {\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        charSet: \"UTF-8\"\n                    }, void 0, false, {\n                        fileName: \"/Users/Abdulaziz/Desktop/mochitv.uz/pages/_app.js\",\n                        lineNumber: 59,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"meta\", {\n                        name: \"viewport\",\n                        content: \"width=device-width, initial-scale=1.0\"\n                    }, void 0, false, {\n                        fileName: \"/Users/Abdulaziz/Desktop/mochitv.uz/pages/_app.js\",\n                        lineNumber: 60,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                        children: \"Anime\"\n                    }, void 0, false, {\n                        fileName: \"/Users/Abdulaziz/Desktop/mochitv.uz/pages/_app.js\",\n                        lineNumber: 61,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Users/Abdulaziz/Desktop/mochitv.uz/pages/_app.js\",\n                lineNumber: 58,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"/Users/Abdulaziz/Desktop/mochitv.uz/pages/_app.js\",\n                lineNumber: 63,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsZ0JBQWdCOztBQUNrQjtBQUNMO0FBQ3dCO0FBRXJELE1BQU1HLFdBQVdELG1FQUFZQSxDQUMzQkUsMENBQW9DLEVBQ3BDQSw2TkFBeUM7QUFHM0MseUJBQXlCO0FBQ3pCLGVBQWVJLGVBQWVDLE1BQU07SUFDbEMsTUFBTU4sU0FDSE8sSUFBSSxDQUFDLFNBQ0xDLE1BQU0sQ0FBQztRQUFFQyxXQUFXLElBQUlDLE9BQU9DLFdBQVc7SUFBRyxHQUM3Q0MsRUFBRSxDQUFDLE1BQU1OO0FBQ2Q7QUFFZSxTQUFTTyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ2xEbEIsZ0RBQVNBLENBQUM7UUFDUixnQ0FBZ0M7UUFDaEMsTUFBTW1CLE1BQU1DLGFBQWFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUNGLEtBQUs7UUFFVixJQUFJRztRQUNKLElBQUk7WUFBRUEsT0FBT0MsS0FBS0MsS0FBSyxDQUFDTDtRQUFNLEVBQUUsT0FBTTtZQUFFO1FBQVE7UUFDaEQsSUFBSSxDQUFDRyxNQUFNRyxJQUFJO1FBRWYscUNBQXFDO1FBQ3JDakIsZUFBZWMsS0FBS0csRUFBRTtRQUV0QixtREFBbUQ7UUFDbkQsTUFBTUMsV0FBV0MsWUFBWTtZQUMzQm5CLGVBQWVjLEtBQUtHLEVBQUU7UUFDeEIsR0FBRyxJQUFJLEtBQUssT0FBTyxXQUFXO1FBRTlCLG1EQUFtRDtRQUNuRCxNQUFNRyxpQkFBaUIsSUFBTXBCLGVBQWVjLEtBQUtHLEVBQUU7UUFDbkRJLE9BQU9DLGdCQUFnQixDQUFDLGFBQWFGLGdCQUFnQjtZQUFFRyxTQUFTO1FBQUs7UUFDckVGLE9BQU9DLGdCQUFnQixDQUFDLFdBQVdGLGdCQUFnQjtZQUFFRyxTQUFTO1FBQUs7UUFDbkVGLE9BQU9DLGdCQUFnQixDQUFDLGNBQWNGLGdCQUFnQjtZQUFFRyxTQUFTO1FBQUs7UUFFdEUsNENBQTRDO1FBQzVDLE1BQU1DLGVBQWUsSUFBTXhCLGVBQWVjLEtBQUtHLEVBQUU7UUFDakRJLE9BQU9DLGdCQUFnQixDQUFDLGdCQUFnQkU7UUFFeEMsT0FBTztZQUNMQyxjQUFjUDtZQUNkRyxPQUFPSyxtQkFBbUIsQ0FBQyxhQUFhTjtZQUN4Q0MsT0FBT0ssbUJBQW1CLENBQUMsV0FBV047WUFDdENDLE9BQU9LLG1CQUFtQixDQUFDLGNBQWNOO1lBQ3pDQyxPQUFPSyxtQkFBbUIsQ0FBQyxnQkFBZ0JGO1FBQzdDO0lBQ0YsR0FBRyxFQUFFO0lBRUwscUJBQ0U7OzBCQUNFLDhEQUFDL0Isa0RBQUlBOztrQ0FDSCw4REFBQ2tDO3dCQUFLQyxTQUFROzs7Ozs7a0NBQ2QsOERBQUNEO3dCQUFLRSxNQUFLO3dCQUFXQyxTQUFROzs7Ozs7a0NBQzlCLDhEQUFDQztrQ0FBTTs7Ozs7Ozs7Ozs7OzBCQUVULDhEQUFDdEI7Z0JBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7QUFHOUIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcml2YXRlLy4vcGFnZXMvX2FwcC5qcz9lMGFkIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHBhZ2VzL19hcHAuanNcbmltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBIZWFkIGZyb20gJ25leHQvaGVhZCc7XG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuXG5jb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChcbiAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMLFxuICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWVxuKTtcblxuLy8gbGFzdF9zZWVuIG5pIHlhbmdpbGFzaFxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlTGFzdFNlZW4odXNlcklkKSB7XG4gIGF3YWl0IHN1cGFiYXNlXG4gICAgLmZyb20oJ3VzZXJzJylcbiAgICAudXBkYXRlKHsgbGFzdF9zZWVuOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSlcbiAgICAuZXEoJ2lkJywgdXNlcklkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIExvY2FsU3RvcmFnZSBkYW4gdXNlcm5pIG9saXNoXG4gICAgY29uc3QgcmF3ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FuaW1lX3VzZXInKTtcbiAgICBpZiAoIXJhdykgcmV0dXJuO1xuXG4gICAgbGV0IHVzZXI7XG4gICAgdHJ5IHsgdXNlciA9IEpTT04ucGFyc2UocmF3KTsgfSBjYXRjaCB7IHJldHVybjsgfVxuICAgIGlmICghdXNlcj8uaWQpIHJldHVybjtcblxuICAgIC8vIFNhaGlmYSBvY2hpbGdhbmRhIGRhcmhvbCB5YW5naWxhc2hcbiAgICB1cGRhdGVMYXN0U2Vlbih1c2VyLmlkKTtcblxuICAgIC8vIEhhciAzIGRhcWlxYWRhIGJpciB5YW5naWxhYiB0dXJpc2ggKGZhb2wgYm8nbHNhKVxuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdXBkYXRlTGFzdFNlZW4odXNlci5pZCk7XG4gICAgfSwgMyAqIDYwICogMTAwMCk7IC8vIDMgZGFxaXFhXG5cbiAgICAvLyBTaWNocW9uY2hhIC8ga2xhdmlhdHVyYSBoYXJha2F0aWRhIGhhbSB5YW5naWxhc2hcbiAgICBjb25zdCBoYW5kbGVBY3Rpdml0eSA9ICgpID0+IHVwZGF0ZUxhc3RTZWVuKHVzZXIuaWQpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBoYW5kbGVBY3Rpdml0eSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlQWN0aXZpdHksIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGhhbmRsZUFjdGl2aXR5LCB7IHBhc3NpdmU6IHRydWUgfSk7XG5cbiAgICAvLyBTYWhpZmEgeW9waWxnYW5kYSBoYW0gb3hpcmdpIG1hcnRhIHlvemlzaFxuICAgIGNvbnN0IGhhbmRsZVVubG9hZCA9ICgpID0+IHVwZGF0ZUxhc3RTZWVuKHVzZXIuaWQpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBoYW5kbGVVbmxvYWQpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZUFjdGl2aXR5KTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlQWN0aXZpdHkpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBoYW5kbGVBY3Rpdml0eSk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgaGFuZGxlVW5sb2FkKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEhlYWQ+XG4gICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJVVEYtOFwiIC8+XG4gICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCIgLz5cbiAgICAgICAgPHRpdGxlPkFuaW1lPC90aXRsZT5cbiAgICAgIDwvSGVhZD5cbiAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cbiAgICA8Lz5cbiAgKTtcbn0iXSwibmFtZXMiOlsidXNlRWZmZWN0IiwiSGVhZCIsImNyZWF0ZUNsaWVudCIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwidXBkYXRlTGFzdFNlZW4iLCJ1c2VySWQiLCJmcm9tIiwidXBkYXRlIiwibGFzdF9zZWVuIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwiZXEiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJyYXciLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwidXNlciIsIkpTT04iLCJwYXJzZSIsImlkIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImhhbmRsZUFjdGl2aXR5Iiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsInBhc3NpdmUiLCJoYW5kbGVVbmxvYWQiLCJjbGVhckludGVydmFsIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm1ldGEiLCJjaGFyU2V0IiwibmFtZSIsImNvbnRlbnQiLCJ0aXRsZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("next/head");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@supabase/supabase-js":
/*!****************************************!*\
  !*** external "@supabase/supabase-js" ***!
  \****************************************/
/***/ ((module) => {

module.exports = import("@supabase/supabase-js");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();