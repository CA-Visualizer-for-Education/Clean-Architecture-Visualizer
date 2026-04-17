import { FileRelation, FileContent } from "../../lib";

export const mockFileTree = {
  id: "src",
  name: "src",
  type: "directory",
  path: "src/",
  children: [
    {
      id: "src/interface_adapters",
      name: "interface_adapters",
      type: "directory",
      path: "src/interface_adapters/",
      layer: "InterfaceAdapters",
      children: [
        {
          id: "src/interface_adapters/UserSignOutController.java",
          name: "UserSignOutController.java",
          type: "file",
          path: "src/interface_adapters/UserSignOutController.java",
          hasViolation: false,
        },
        {
          id: "src/interface_adapters/UserSignOutPresenter.java",
          name: "UserSignOutPresenter.java",
          type: "file",
          path: "src/interface_adapters/UserSignOutPresenter.java",
          hasViolation: true,
        },
        {
          id: "src/interface_adapters/UserSignOutViewModel.java",
          name: "UserSignOutViewModel.java",
          type: "file",
          path: "src/interface_adapters/UserSignOutViewModel.java",
          hasViolation: true,
        },
      ],
    },
    {
      id: "src/use_cases",
      name: "use_cases",
      type: "directory",
      path: "src/use_cases/",
      layer: "ApplicationBusinessRules",
      children: [
        {
          id: "src/use_cases/UserSignOutInteractor.java",
          name: "UserSignOutInteractor.java",
          type: "file",
          path: "src/use_cases/UserSignOutInteractor.java",
          hasViolation: true,
        },
        {
          id: "src/use_cases/UserSignOutInputBoundary.java",
          name: "UserSignOutInputBoundary.java",
          type: "file",
          path: "src/use_cases/UserSignOutInputBoundary.java",
          hasViolation: false,
        },
        {
          id: "src/use_cases/UserSignOutInputData.java",
          name: "UserSignOutInputData.java",
          type: "file",
          path: "src/use_cases/UserSignOutInputData.java",
          hasViolation: false,
        },
        {
          id: "src/use_cases/UserSignOutOutputBoundary.java",
          name: "UserSignOutOutputBoundary.java",
          type: "file",
          path: "src/use_cases/UserSignOutOutputBoundary.java",
          hasViolation: false,
        },
        {
          id: "src/use_cases/UserSignOutOutputData.java",
          name: "UserSignOutOutputData.java",
          type: "file",
          path: "src/use_cases/UserSignOutOutputData.java",
          hasViolation: false,
        },
      ],
    },
    {
      id: "src/entities",
      name: "entities",
      type: "directory",
      path: "src/entities/",
      layer: "EnterpriseBusinessRules",
      children: [
        {
          id: "src/entities/UserSession.java",
          name: "UserSession.java",
          type: "file",
          path: "src/entities/UserSession.java",
          hasViolation: false,
        },
      ],
    },
    {
      id: "src/views",
      name: "views",
      type: "directory",
      path: "src/views/",
      layer: "Frameworks",
      children: [
        {
          id: "src/views/UserSignOutView.java",
          name: "UserSignOutView.java",
          type: "file",
          path: "src/views/UserSignOutView.java",
          hasViolation: false,
        },
      ],
    },
    {
      id: "src/framework_drivers",
      name: "framework_drivers",
      type: "directory",
      path: "src/framework_drivers/",
      layer: "Frameworks",
      children: [
        {
          id: "src/framework_drivers/UserSignOutDataAccess.java",
          name: "UserSignOutDataAccess.java",
          type: "file",
          path: "src/framework_drivers/UserSignOutDataAccess.java",
          hasViolation: false,
        },
        {
          id: "src/framework_drivers/Database.java",
          name: "Database.java",
          type: "file",
          path: "src/framework_drivers/Database.java",
          hasViolation: false,
        },
      ],
    },
  ],
};

export const mockFiles: Record<string, FileContent> = {
  "src/interface_adapters/UserSignOutController.java": {
    file_path: "src/interface_adapters/UserSignOutController.java",
    content: `package interface_adapters;

import use_cases.UserSignOutInputBoundary;
import use_cases.UserSignOutInputData;
import use_cases.UserSignOutInteractor;

public class UserSignOutController {
  private final UserSignOutInputBoundary interactor;

  public UserSignOutController(UserSignOutInteractor interactor) {
        this.interactor = interactor;
    }

  public void execute(String userId) {
    UserSignOutInputData inputData = new UserSignOutInputData(userId);
    interactor.execute(inputData);
    }
}`,
    language: "java",
    layer: "InterfaceAdapters",
    lines_with_violations: [],
  },
  "src/interface_adapters/UserSignOutPresenter.java": {
  file_path: "src/interface_adapters/UserSignOutPresenter.java",
  content: `package interface_adapters;

import framework_drivers.Database;
import use_cases.UserSignOutOutputBoundary;
import use_cases.UserSignOutOutputData;

public class UserSignOutPresenter implements UserSignOutOutputBoundary {
  private final UserSignOutViewModel viewModel;
  private final Database database;

  public UserSignOutPresenter(UserSignOutViewModel viewModel, Database database) {
    this.viewModel = viewModel;
    this.database = database;
  }

  @Override
  public void present(UserSignOutOutputData outputData) {
    viewModel.setStatus(outputData.message());
  }
}`,
  language: "java",
  layer: "InterfaceAdapters",
  lines_with_violations: [3],
  },
  "src/interface_adapters/UserSignOutViewModel.java": {
  file_path: "src/interface_adapters/UserSignOutViewModel.java",
  content: `package interface_adapters;

public class UserSignOutViewModel {
  private String status = "";
  private final java.util.Map<String, String> state = new java.util.HashMap<>();

  public void setStatus(String status) {
    this.status = status;
    state.put("status", status);
  }

  public String getStatus() {
    return status;
  }
}`,
  language: "java",
  layer: "InterfaceAdapters",
  lines_with_violations: [5],
  },
  "src/use_cases/UserSignOutInteractor.java": {
    file_path: "src/use_cases/UserSignOutInteractor.java",
    content: `package use_cases;

import framework_drivers.Database;
import entities.UserSession;

public class UserSignOutInteractor implements UserSignOutInputBoundary {
    private final Database database;
  private final UserSignOutOutputBoundary outputBoundary;

  public UserSignOutInteractor(Database database, UserSignOutOutputBoundary outputBoundary) {
        this.database = database;
    this.outputBoundary = outputBoundary;
    }

  @Override
  public void execute(UserSignOutInputData inputData) {
    UserSession session = new UserSession(inputData.userId());
    database.clearSession();
    outputBoundary.present(new UserSignOutOutputData("Signed out: " + session.userId()));
    }
}`,
    language: "java",
    layer: "ApplicationBusinessRules",
    lines_with_violations: [3],
  },
  "src/use_cases/UserSignOutInputBoundary.java": {
  file_path: "src/use_cases/UserSignOutInputBoundary.java",
  content: `package use_cases;

public interface UserSignOutInputBoundary {
  void execute(UserSignOutInputData inputData);
}`,
  language: "java",
  layer: "ApplicationBusinessRules",
  lines_with_violations: [],
  },
  "src/use_cases/UserSignOutInputData.java": {
  file_path: "src/use_cases/UserSignOutInputData.java",
  content: `package use_cases;

public record UserSignOutInputData(String userId) {
}`,
  language: "java",
  layer: "ApplicationBusinessRules",
  lines_with_violations: [],
  },
  "src/use_cases/UserSignOutOutputBoundary.java": {
  file_path: "src/use_cases/UserSignOutOutputBoundary.java",
  content: `package use_cases;

public interface UserSignOutOutputBoundary {
  void present(UserSignOutOutputData outputData);
}`,
  language: "java",
  layer: "ApplicationBusinessRules",
  lines_with_violations: [],
  },
  "src/use_cases/UserSignOutOutputData.java": {
  file_path: "src/use_cases/UserSignOutOutputData.java",
  content: `package use_cases;

public record UserSignOutOutputData(String message) {
}`,
  language: "java",
  layer: "ApplicationBusinessRules",
  lines_with_violations: [],
  },
  "src/entities/UserSession.java": {
  file_path: "src/entities/UserSession.java",
  content: `package entities;

public record UserSession(String userId) {
}`,
  language: "java",
  layer: "EnterpriseBusinessRules",
  lines_with_violations: [],
  },
  "src/views/UserSignOutView.java": {
    file_path: "src/views/UserSignOutView.java",
    content: `package views;

import javax.swing.JPanel;
import interface_adapters.UserSignOutViewModel;

public class UserSignOutView extends JPanel {
  private final UserSignOutViewModel viewModel;

  public UserSignOutView(UserSignOutViewModel viewModel) {
    this.viewModel = viewModel;
  }

  public String renderStatus() {
    return viewModel.getStatus();
  }
}`,
    language: "java",
    layer: "Frameworks",
    lines_with_violations: [],
  },
  "src/framework_drivers/UserSignOutDataAccess.java": {
    file_path: "src/framework_drivers/UserSignOutDataAccess.java",
    content: `package framework_drivers;

public class UserSignOutDataAccess {
    public void clear() {
    }
}`,
    language: "java",
    layer: "Frameworks",
    lines_with_violations: [],
  },
  "src/framework_drivers/Database.java": {
    file_path: "src/framework_drivers/Database.java",
    content: `package framework_drivers;

public class Database {
    public void clearSession() {
    }
}`,
    language: "java",
    layer: "Frameworks",
    lines_with_violations: [],
  },
};

export const mockFileRelationsByPath: Record<string, FileRelation[]> = {
  "src/interface_adapters/UserSignOutController.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/use_cases/UserSignOutInputBoundary.java",
      line: 3,
      description: "Controller depends on input boundary.",
      layer: "ApplicationBusinessRules",
    },
    {
      type: "DEPENDENCY",
      target_file: "src/use_cases/UserSignOutInputData.java",
      line: 4,
      description: "Controller creates input data for the use case.",
      layer: "ApplicationBusinessRules",
    },
  ],
  "src/interface_adapters/UserSignOutPresenter.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/framework_drivers/Database.java",
      line: 3,
      description: "Violation: presenter depends on framework driver.",
      layer: "Frameworks",
    },
    {
      type: "DEPENDENCY",
      target_file: "src/interface_adapters/UserSignOutViewModel.java",
      line: 8,
      description: "Presenter updates the view model.",
      layer: "InterfaceAdapters",
    },
  ],
  "src/use_cases/UserSignOutInteractor.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/framework_drivers/Database.java",
      line: 3,
      description: "Interactor depends on database driver.",
      layer: "Frameworks",
    },
    {
      type: "DEPENDENCY",
      target_file: "src/entities/UserSession.java",
      line: 4,
      description: "Interactor uses entity session model.",
      layer: "EnterpriseBusinessRules",
    },
    {
      type: "DEPENDENCY",
      target_file: "src/use_cases/UserSignOutOutputBoundary.java",
      line: 8,
      description: "Interactor depends on output boundary.",
      layer: "ApplicationBusinessRules",
    },
  ],
  "src/views/UserSignOutView.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/interface_adapters/UserSignOutViewModel.java",
      line: 4,
      description: "View reads state from view model.",
      layer: "InterfaceAdapters",
    },
  ],
  "src/framework_drivers/UserSignOutDataAccess.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/framework_drivers/Database.java",
      line: 4,
      description: "Data access delegates persistence to database.",
      layer: "Frameworks",
    },
  ],
};