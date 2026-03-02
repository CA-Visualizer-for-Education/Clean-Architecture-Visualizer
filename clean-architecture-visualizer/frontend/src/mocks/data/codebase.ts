export const mockFileTree = {
  id: "src",
  name: "src",
  type: "directory",
  path: "src/",
  children: [
    {
      id: "src/entities",
      name: "entities",
      type: "directory",
      path: "src/entities/",
      layer: "EnterpriseBusinessRules",
      children: [
        {
          id: "src/entities/User.java",
          name: "User.java",
          type: "file",
          path: "src/entities/User.java",
          hasViolation: false
        }
      ]
    },
    {
      id: "src/interface_adapters",
      name: "interface_adapters",
      type: "directory",
      path: "src/interface_adapters/",
      layer: "InterfaceAdapters",
      children: [
        {
          id: "src/interface_adapters/UserSignupController.java",
          name: "UserSignupController.java",
          type: "file",
          path: "src/interface_adapters/UserSignupController.java",
          hasViolation: true
        }
      ]
    }
  ]
};

export const mockFileContent = {
  file_path: "src/interface_adapters/UserSignupController.java",
  content: `package interface_adapters;

import users.UserSignupInputBoundary;
import users.UserSignupInputData;

public class UserSignupController {

    final UserSignupInputBoundary userInput;

    public UserSignupController(UserSignupInputBoundary accountGateway) {
        this.userInput = accountGateway;
    }

    public void create(String username, String password1, String password2) {
        UserSignupInputData userSignupInputData = new UserSignupInputData(
                username, password1, password2);

        userInput.createUser(userSignupInputData);
    }
}`,
  language: "java", 
  Violation_words: ["users.UserSignupInputBoundary"], 
  lines_with_violations: [3, 8] 
};

export const mockComponentRelations = {
  component_id: "UserSignupInputData",
  relations: [
    {
      type: "INSTANTIATION",
      file: "src/interface_adapters/UserSignupController.java",
      line: 42,
      description: "Input Data is created here from controller parameters." 
    },
    {
      type: "PARAMETER_PASS",
      file: "src/use_cases/UserSignupInteractor.java",
      line: 15,
      description: "Passed into the Interactor's execute method."
    }
  ]
};