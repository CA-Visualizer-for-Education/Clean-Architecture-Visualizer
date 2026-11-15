---
sidebar_position: 1.6
---

# Where does input cleaning go?

When a user enters and chooses values in your program, they rarely arrive in the form your use case code needs. A value might have extra spaces, come in as a string when you need a number, or break a rule your program depends on. Someone has to fix it or reject it. In Clean Architecture, the question is *which layer* does that job.

The short answer: **it depends on what kind of rule it is.** Ask one question about each rule:

> Would this rule still apply if the input arrived some other way: from a web form, a command line, a test, or another program?

## Format rules belong at the boundary

Some rules exist only because of *how* the input arrived. They're about format:

- trimming whitespace someone typed by accident
- turning the text `"42"` into the number `42`
- splitting `"a, b, c"` into a list
- reading a date out of a string
- parsing a JSON request body into an object, and checking it has the fields you need

These belong in the **controller**, the interface adapter that receives the input. Its job is to translate data from the form that suits the outside world into the form that suits the use case. The controller cleans the raw input, puts it into an **Input Data** object, and passes that to the use case.

Checking that the JSON has the fields you need isn't busywork. It's how the controller **meets the precondition** of the method it's about to call. A use case's `execute` method expects Input Data with a non-empty name; the controller's job is to make sure that's true before it calls `execute`. If the input can't meet the precondition, the controller rejects it right there, and the use case never has to deal with the problem. It reports the error back to whatever called it, such as an Express route or a Commander action, and that caller tells the user in its own terms: a 400 Bad Request response, or an error message. The presenter turns a use case's Output Data into View Model changes, so it handles the use case's own failures, such as an unsupported language, but never sees input the controller rejected. That's what lets the use case trust its input instead of checking it all over again.

Industry does this too. Most web frameworks have a built-in step for it: you describe the shape the input must have, and the framework rejects anything that doesn't fit before your code runs. In TypeScript, a popular library for this is Zod. A common slogan is **"parse, don't validate"**: turn raw input into a properly typed value as soon as it enters your program, so no code further in ever handles raw strings.

## Business rules belong inside

Other rules are about *what the program means*, not how the input arrived:

- a username must be unique
- a course code must be three letters followed by three digits
- a withdrawal can't exceed the account balance

These rules hold no matter where the input came from, so they belong in the **use case** (the Interactor) or in an **entity**. If you put them in a controller, every new way of getting input (a new page, a new command, an API) must remember to repeat them. Sooner or later one won't.

When a value has rules of its own, it can earn its own small class, a **value object**: for example, a `CourseCode` class whose constructor rejects anything that isn't a valid course code. Then any code holding a `CourseCode` knows it's valid.

## What about Input Data?

Input Data is usually a plain data object: it carries values from the controller to the use case and does nothing else.

## An example from CAVE

When you set up a project, CAVE asks which programming language it uses. It does three things to your answer:

1. **It trims spaces from the ends** (`" Java "` → `"Java"`).
2. **It ignores case** (`"Java"` → `"java"`).
3. **It rejects anything that isn't `java`, `python`, `typescript`, or `javascript`.**

Steps 1 and 2 are format clean-up: stray spaces and capital letters are accidents of typing. They belong in the controller. Step 3 is different: it's a business rule, because these are the four languages CAVE supports, however the answer arrives. It belongs in the use case.

Today CAVE does all three steps in the use case. Issue #275 proposes moving input cleaning into the controller; steps 1 and 2 belong there.

Names show the same thing. When you create a feature or a use case, CAVE removes every space from its name (`"Log In"` → `"LogIn"`). That isn't tidying up after typing. The name becomes folder and file names in your project (`LogInController.java`), and in Java a file's name must match the class inside it, so it can't contain spaces. That rule holds however the name arrives, so it's a business rule. It belongs in the use case, or in a small value object in `src/entity/`, such as `UseCaseName`.

Two lines of cleaning code that look alike can belong in different layers. The question to ask isn't "is this cleaning?" but "**whose rule is this?**"

## Summary

| Kind of rule | Example | Where it goes |
|---|---|---|
| Format: how the input arrived | trim, parse, split, parse JSON and check its fields | Controller |
| Business: what the program means | unique, valid name, within balance | Use case, entity, or value object |
| Carrying values between layers | the cleaned values | Input Data, a plain data object |
