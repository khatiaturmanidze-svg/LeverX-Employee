12/02
Main page
Refactoring Header Component

- moved Logo into reusable stateless component
- moved log off button into reusable stateless component
- moved Header Tabs as separate component that encapsulates its own logic (stateful)

created TabGroup reusable

- using it on address book
- search toggle
- grid/list view

employee cards

- combined employee grid card and list card, for dry principle
- removed unnessecary code from Main
- broke Main page incapsulated/reusable components

#### config of lint staged & husky, prettier, eslint.

13/02
Roles page

- created reusable roles button, so now we can add as many roles as we want
- created useFilteredItems hook
