## What I want to get done this week:
- [x] Change instances of React.FA to use a function call
- [ ] Finish the CA Diagram
  - [x] make nodes clickable (completed the styling aspects). 
  - [ ] design side panel for errors/ learning diagram suggestions
  - [ ] setup routing for learning mode page
  - [ ] Add support for multiple nodes of the same kind.
     
  ## Design decisions
Note this covers weeks 7-9.

Originally, the universal styling variables were set up as a series of variables in a TypeScript file. The implications of this were that all the styling would need to be in-line CSS to make use of these variables, which we decided wasn't ideal and would also prevent defining hover states. 
In week 8, I switched to setting up an extension of the materials UI theme, which also allowed a dark mode and light mode to be defined, although only a light mode was implemented. This allows us to use sx (similar to inline CSS) to customize existing MUI components, or create "styled" components with more extensive styling definitions. 
