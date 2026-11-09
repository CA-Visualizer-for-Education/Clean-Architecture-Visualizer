# Clean-Architecture-Visualizer

Imagine an app that allows exploration of an application using a CA engine-like diagram where each use case interaction is in a different layer.

## Background

Students finish first year having learned Python, including OOP and testing and the regular baby data structures (stacks queues trees linked lists recursion). Most have never written a large program from scratch, and most assignments are run-once rather than interactive.

## CSC207 Software Design

CSC207 happens in September of second year. Many or most course design choices are aimed at preparing students for their first internship after second year.

We teach:

- Teamwork (teams of ~6 students lasting the whole semester)
- Java (inheritance, interface vs. class, static vs instance, accessibility modifiers, generics, Java Swing)
- Git/GitHub (distributed version control, branching, merging, pull requests, issue tracking)
- User stories (for the client) then use cases (for developers)
- How web APIs work, including JSON as the lingua franca
- SOLID principles (motivated by low coupling and high cohesion and separation of concerns)
- 6 design patterns (Structural: Adapter, Façade; Creational: Builder, Factory; Behavioural: Observer, Strategy)
- A layered software architecture (We’ve been teaching Clean Architecture for a few years)
- Crossing layers safely (examples of design patterns and dependency injection)
- How to grow a large program in a team using all of this (with a full-semester project)

The problem: lots of students struggle to understand Clean Architecture (CA) and buy into it. Some start to get it once they really understand that the context is a large, long-lived project rather than a 4-month toy program. I want to make this much easier for them: I want a CA visualizer and explorer that sits on top of a Git repo.

## Course principles

Here are a set of principles that we use to motivate a layered architecture. The bold words are CA terminology.

- Every problem domain has a set of business terminology and business concepts that come with it.
- Data is long-lived and persistent. Data structures are temporary, and exist only to support the business logic.
- Every user interaction needs code to do the thing (handle button clicks and so on). Changing existing code is risky, even with a good set of tests, so we want to avoid it when we can: we write new code for each interaction as much as possible.
- Swapping out the **View** (UI) or the **Data Access** (the DB and APIs) shouldn’t change the business logic, so we isolate them. We’ll collectively call these the **Frameworks & Drivers** layer: anything that represents a technology choice.
- We call the business logic part that handles a single user interaction a **Use Case Interactor**, or Interactor for short.
- The persistence layer is responsible for translating persistent data into useful data structures for the business logic. We call these data structures **Entities**. Entities are designed to reflect the terminology and concepts from the problem domain so that code is somewhat self-documenting.
- We need a translation layer between the View and the Interactors. We call these objects **Interface Adapters**. Each UI screen, or even each part of a screen, is backed by an Interface Adapter called a **View Model**, which contains all the data for the UI to display.
- For each user interaction (see the attached image):
  - The View sends raw UI data to an Interface Adapter called a **Controller**; the Controller wraps that data up into an **Input Data** object and invokes an Interactor. No Entities yet, just raw data, like bank account numbers and dates.
  - The Interactor requests appropriate Entities from a Data Access object (think CRUD).
  - The Interactor uses these Entities to perform the business logic.
  - The Interactor makes the result persistent by asking a Data Access object to save any changes (more CRUD).
  - The Interactor invokes a **Presenter**, sending it any new data to show to the user as an **Output Data** object.
  - The Presenter updates any relevant View Models.
  - Using the Observer pattern, the View reacts to the View Model changes and updates the UI.

### The Interactors are the beating hearts of a CA program

Want to swap the UI and DB? **The Interactor code should not change**, nor should the unit tests for that Interactor. That means Interactors are isolated: they depend on nothing but Entities, so each Interactor needs to specify the following:

- How a Controller should invoke the Interactor (an **Input Boundary**: a Java interface, usually with a single method)

* What user info the Controller needs to send (in an **Input Data** object, which is the only parameter in the Input Boundary; sometimes called a "request model")
* What CRUD operations the Interactor needs from a Data Access object (another Java interface or set of interfaces)
* What information it needs to display to the user (an **Output Data** object; sometimes called a “response model”)
* What method the Interactor will call on the Presenter (an **Output Boundary** that the Presenter implements: a Java interface, usually with a single method)

Here’s the cycle in a nutshell. All the bold parts are entirely new code for each user interaction. Follow the data through the image below.

View —> **Controller** —> **Interactor** —> Data Access (request Entities) —> **business logic** —> Data Access (persist updated Entities) —> **Presenter** —> View Model —> View

## Example: transferring money from one bank account to another

This requires the user to select 2 bank accounts and an amount of money, then triggering the transfer. The heart of the program that manages this business logic can be expressed with two BankAccount objects and a Money object. These will be our Entities for this user interaction.

The flow:

1. **View**: user selects From and To bank accounts (probably the bank account numbers) and an amount of money, then clicks a button to initiate the transfer. This calls an actionPerformed method that simply sends this data plus maybe a timestamp to a TransferController adapter. (In an ideal world, every user interaction has its own Controller.)
2. TransferController: wrap the account numbers, money, and timestamp (probably translated into a java.util.Date object) into a single TransferInputData object and invoke the TransferInteractor. There are no Entities yet, just raw data.
3. The TransferInteractor asks a Data Access object (pure CRUD!) to inflate the two BankAccount entities, each of which probably has a currentBalance instance variable of type Money. Each DAO may be used by many Interactors, and so implements any necessary Data Access Interfaces.
4. The TransferInteractor subtracts money from one BankAccount balance and adds it to the other BankAccount.
5. The TransferInteractor asks a Data Access object to save the new BankAccount information.
6. The TransferInteractor wraps the two bank account numbers, the new balances, the timestamp, and the amount of money into an TransferOutputData object. (This is raw data, not Entities! Entities never leak into the Interface Adapter layer.)
7. The TransferInteractor passes the TransferOutputData to the TransferPresenter.
8. The TransferPresenter makes any necessary changes to any relevant View Models.
9. The View reacts, updating the UI.

Below is an image that we call the Clean Architecture Engine: think of it as an object diagram, not a class diagram. The pink part is entirely new for each user interaction, and so are the Controller and Presenter.

The main program is not part of Clean Architecture. Instead, it is responsible for building the engine (we use the Builder pattern, it’s a beautiful example), using Dependency Injection everywhere to avoid hard dependencies, and then gets out of the way.

The goal of this project is to create an CA Engine visualizer that reads from a Git repo containing a Java program and allows exploration of the code. For example, there will be a list of user interactions. Selecting one will display the appropriate pink and green layers. Hovering over a box will show info about that box. There will be a way to explore code. There may be a way to easily create code for a new user interaction (duplicate the pink and green layers and set up the flow as much as possible).

The project will be written for the web. I’m leaning toward MERN so I can learn it but am open to other suggestions! Mainly, I want the project code to use Clean Architecture; we often have students asking how to do CA in other languages and with other frameworks.

![CleanArchitectureEngine.png](resources%2FCleanArchitectureEngine.png)
