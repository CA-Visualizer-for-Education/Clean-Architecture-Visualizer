---
sidebar_position: 1.7
---

# Validating input in CAVE

Input reaches CAVE through two front doors: the command line (Commander, in `src/app/index.ts`) and the web server (Express, in `src/server/routes/`). Both doors call the same controllers. This page shows which layer checks what, using one example: creating a use case.

```
cave usecase "Log In"
POST /api/template/add/Log%20In
```

## Who checks what

| Layer | What it checks | How it reports a failure |
|---|---|---|
| Front door (Commander action, Express route) | No checks on the value itself: it only gets the raw value out of the command line or the request. Commander still rejects a missing `<name>`. | Turns the controller's `InvalidInputError` into its own kind of error: a message and exit code 1, or a 400 response. |
| Controller | Format: trims stray spaces and rejects a blank name. | Throws `InvalidInputError`. The use case never runs. |
| Input Data | Nothing. It carries the cleaned value. | — |
| Use case, with a value object | Business rules: a name becomes a class name, so it must be a legal one; the use case must not already exist. | Calls the presenter's `showFailView`. |

The question to ask about each check is "**whose rule is this?**" A rule that exists only because of how the input was typed belongs to the controller. A rule that holds however the input arrives belongs to the use case.

## Controller: clean up the format

The controller is shared by both front doors, so a check written here covers both.

```ts
// src/interface_adapter/invalid-input-error.ts
export class InvalidInputError extends Error {}
```

```ts
// src/interface_adapter/createUseCase/createUseCaseController.ts
export class CreateUseCaseController {
  constructor(private readonly inputBoundary: CreateUseCaseInputBoundary) {}

  async execute(rawName: string): Promise<void> {
    const useCaseName = rawName.trim();
    if (useCaseName === '') {
      throw new InvalidInputError('Enter a name for the use case.');
    }
    await this.inputBoundary.execute(new CreateUseCaseInputData(useCaseName));
  }
}
```

Now the use case can rely on a precondition: the name it receives is trimmed and not blank.

## Use case: apply the business rules

`"Log In"` becomes the folder `LogIn/` and the file `LogInController.java`, so the name, with its spaces removed, must be a legal class name. That rule doesn't depend on how the name arrived, so it lives in a small **value object** in `src/entity/`. It isn't an Entity in the glossary's sense, since nothing loads it from storage, but it holds a rule of the problem domain, so it lives in the same innermost layer. Any code holding a `UseCaseName` knows it's valid.

```ts
// src/entity/use-case-name.ts
export class UseCaseName {
  readonly value: string;

  constructor(name: string) {
    const joined = name.split(' ').join('');
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(joined)) {
      throw new Error(
        `"${name}" can't be a class name: use letters and digits, starting with a letter.`
      );
    }
    this.value = joined;
  }
}
```

The check also stops names such as `../Login` or `a/b`. Without it, a name containing `..` could make CAVE create folders and files anywhere on your computer that you can write to.

The interactor builds the value object and reports any failure through the presenter, like any other failure of the use case:

```ts
// src/use_case/createUseCase/createUseCaseInteractor.ts
async execute(inputData: CreateUseCaseInputData): Promise<void> {
  let useCaseName: UseCaseName;
  try {
    useCaseName = new UseCaseName(inputData.getUseCaseName());
  } catch (err) {
    if (err instanceof Error) {
      this.presenter.showFailView(err.message);
      return;
    }
    throw err;
  }

  // ...find the project's use_case and interface_adapter folders, as now.
  // This sketch checks only targetUseCasePath; the real interactor checks both.
  if (await this.fileAccess.exists(targetUseCasePath)) {
    this.presenter.showFailView(
      `Use case ${useCaseName.value} already exists. Please choose a different name.`
    );
    return;
  }
  // ...create the folders and files, then this.presenter.showSuccessView()
}
```

## Front doors: report a rejected input

When the controller throws `InvalidInputError`, the use case and presenter never see the input. Each front door tells the user in its own terms.

On the command line, Commander's `program.error` prints the message and exits with code 1:

```ts
// src/app/index.ts
program
  .command('usecase <name>')
  .description('Create the template for a new use case')
  .action(async (name: string) => {
    try {
      await app.runCreateUseCase(name);
    } catch (err) {
      if (err instanceof InvalidInputError) program.error(err.message);
      throw err;
    }
  });
```

On the web server, Express 5 passes an error thrown in an `async` route to error-handling middleware, which answers with 400 Bad Request:

```ts
// src/server/server.ts, after the routes
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InvalidInputError) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
});
```

Failures of the use case itself (an illegal name, a use case that already exists) still come back through the presenter, as they do today.

## Checking twice is fine

An outer layer may check something again to give the user a quicker or clearer message. For example, the web page could refuse an empty name before sending it. The check in the inner layer is the one that counts, because it holds for every front door. The use case doesn't repeat the controller's format checks; its own rules are about what the name means.

## Where CAVE is today

CAVE's controllers don't clean anything yet: they pass the raw value straight to the use case, and the use cases do all the checking. The use cases only remove spaces from names; there's no `UseCaseName` class yet. Issue #275 proposes moving input cleaning into the controllers. Removing spaces from names is a business rule, so it stays in the use case. For why each rule goes where it does, see [Where does input cleaning go?](./Input-Cleaning.md).
