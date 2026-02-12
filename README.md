# fix

- in AvatarSection.tsx move button to reusable components
  - always providewidth and height. also weird class name for the image, better create reusable Icon component, also no alt (avatar-section\_\_link?)
- DetailRow.tsx - add reusable input components
- EmployeeEdtForm.tsx move validateForm in helpers
- EmployeeView.tsx can be optimized to render sections with rows using proper data format and using .map() to avoid code duplication
  (implement Section component and pass the fields via props)
- avoid creating components inside components
- EmployeeHeader.tsx don't use inline svg, cleate single component for maintaining all the icons
- Main.tsx filtering should be done on BE?
  - handling for {loading, error}
  - pass search to the query args and make it filter on BE ?
- styles are off?

# BUGS

- search on main shouldn't open details page. it's supposed to search and show filtered results in the list ✔️
- sign in/up should be route, using root route. seperate routes for each ✔️
- rewrite server to TS

# CRITICAL BUGS

- email is not trimmed during sign in ✔️
- the sign in error message has [object Object]? what ✔️
- after signup all users removed? ✔️
- invalid data date in details page ✔️

## launching

npm run dev {runs script for webpack}
BE port is 3000, and file is in server/server.js (node server.js)

###

password for users are password${id}
admin is anno.hideaki@leverx.com (password11)
