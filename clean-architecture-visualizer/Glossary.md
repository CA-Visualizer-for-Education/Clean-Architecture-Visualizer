# Glossary 
This file documents terminology related to Clean Architecture and attaches clear meanings to each term for usage by computer science students. Some entries will be brief definitions with an example while other entries will have an extended explanation to match their importance. All terms are defined in the specific context of Clean Architecture.

**domain** 
There are several definitions for domain across fields ranging from law to biology. In the context of clean architecture, the most appropriate definition can be drawn from the idea of the domain of discourse: the objects or entities brought up in some communication or discussion.  

**encapsulation** 
The word encapsulation consists of two parts: en and capsulation. Capsulation is to place something within a capsule. For example, if you have ever taken pills for something, you have taken medicine within a capsule. In other words, you have taken medicine that has undergone capsulation. En is a prefix that simply means to cause something to be. Thus, in plain English, encapsulation means to cause something to be placed within a capsule.  

In the context of programming, encapsulation revolves around placing data and the methods that use this data within access controlled containers. In clean architecture, an object oriented software design approach, these containers are classes.  Closely grouping some data and its related methods in the same class has the obvious benefit of increasing cohesion; with that said, why must access to the contents of classes be controlled for encapsulation?   

Let us think back to the analogy of medicinal capsules. If you did not know already, pill capsules prevent the drugs they contain from reacting with oxygen and are designed to only dissolve and release their contents when exposed to human stomach acid. Beyond protecting the medicine, capsulation makes it easier for one to take this medicine. You interact with a single well defined capsule as opposed to whatever exists within that capsule.  
    
We see that controlling access prevents unauthorized alteration of the contents of the capsule, that we can make design decisions to permit desired access, and that it saves us the trouble of worrying about the specific existence of what is encapsulated.  

In object oriented programming, we control access for these exact reasons. We use private attributes with public methods for getting and setting these attributes to ensure that access is controlled. We can then maintain the way people access these classes, also known as the API, while changing specific implementations of functionality within the class.

**problem** 
The problem is the task that motivates you to develop a piece of software. For example, this could be your boss asking you to make an internal developer tool or your teacher assigning you a project.  

**problem domain**
The collection of entities that are present in the discussion of the task that you are developing software to complete.