export const mockAnalysisSummary = {
  project_name: "CSC207 Project", 
  total_use_cases: 4, 
  total_violations: 8, 
  use_cases: [
    { 
      id: "uc-1", 
      name: "Sign In", 
      violation_count: 0, 
      interactions: [
        { interaction_id: "uc1in1", interaction_name: "Sign In" }
      ] 
    }, 
    { 
      id: "uc-2", 
      name: "Sign Out", 
      violation_count: 5,
      interactions: [
        { interaction_id: "uc2in1", interaction_name: "Logout Logic" },
        { interaction_id: "uc2in2", interaction_name: "Session Invalidation" }
      ]
    }, 
    { 
      id: "uc-3", 
      name: "Multi-factor Authentication", 
      violation_count: 1,
      interactions: [
        { interaction_id: "uc3in1", interaction_name: "Initiate Authentication" },
        { interaction_id: "uc3in2", interaction_name: "Confirm Authentication" }
      ]
    },
    { 
      id: "uc-4", 
      name: "Create User", 
      violation_count: 0,
      interactions: [
        { interaction_id: "uc4in1", interaction_name: "Registration Flow" }
      ]
    }
  ]
};

export const mockInteractionDetails = {
  interaction_name: "Sign Out - Logout Logic",
  nodes: [
    {
      id: "UserSignOutController",
      name: "Controller",
      type: "Controller",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/UserSignOutController.java",
      status: "VALID"
    },
    {
      id: "Entities",
      name: "User Session Entity",
      type: "Entity",
      layer: "EnterpriseBusinessRules",
      file_path: "src/entities/UserSession.java",
      status: "VALID"
    },
    {
      id: "UserSignOutPresenter",
      name: "Presenter",
      type: "Presenter",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/UserSignOutPresenter.java",
      status: "VIOLATION"
    },
    {
      id: "UserSignOutViewModel",
      name: "View Model",
      type: "ViewModel",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/UserSignOutViewModel.java",
      status: "VIOLATION"
    },
    {
      id: "UserSignOutInputBoundary",
      name: "Input Boundary",
      type: "InputBoundary",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/UserSignOutInputBoundary.java",
      status: "VALID"
    },
    {
      id: "UserSignOutInputData",
      name: "Input Data",
      type: "InputData",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/UserSignOutInputData.java",
      status: "VALID"
    },
    {
      id: "UserSignOutInteractor",
      name: "Use Case Interactor",
      type: "Interactor",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/UserSignOutInteractor.java",
      status: "VIOLATION"
    },
    {
      id: "UserSignOutOutputBoundary",
      name: "Output Boundary",
      type: "OutputBoundary",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/UserSignOutOutputBoundary.java",
      status: "VALID"
    },
    {
      id: "UserSignOutOutputData",
      name: "Output Data",
      type: "OutputData",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/UserSignOutOutputData.java",
      status: "VALID"
    },
    {
      id: "UserSignOutDataAccessInterface",
      name: "Data Access Interface",
      type: "DataAccessInterface",
      layer: "ApplicationBusinessRules",
      status: "MISSING"
    },
    {
      id: "UserSignOutView",
      name: "View",
      type: "View",
      layer: "Frameworks",
      file_path: "src/views/UserSignOutView.java",
      status: "VALID"
    },
    {
      id: "UserSignOutDataAccess",
      name: "Data Access",
      type: "DataAccess",
      layer: "Frameworks",
      file_path: "src/framework_drivers/UserSignOutDataAccess.java",
      status: "VALID"
    },
    {
      id: "Database",
      name: "Database",
      type: "Database",
      layer: "Frameworks",
      file_path: "src/framework_drivers/Database.java",
      status: "VALID"
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "UserSignOutController",
      target: "UserSignOutInputBoundary",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-2",
      source: "UserSignOutController",
      target: "UserSignOutInputData",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-3",
      source: "UserSignOutInteractor",
      target: "UserSignOutInputBoundary",
      type: "INHERITANCE",
      status: "VALID"
    },
    {
      id: "edge-4",
      source: "UserSignOutInteractor",
      target: "UserSignOutOutputBoundary",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-5",
      source: "UserSignOutInteractor",
      target: "UserSignOutOutputData",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-6",
      source: "UserSignOutInteractor",
      target: "Entities",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-7",
      source: "UserSignOutPresenter",
      target: "UserSignOutOutputBoundary",
      type: "INHERITANCE",
      status: "VALID"
    },
    {
      id: "edge-8",
      source: "UserSignOutPresenter",
      target: "UserSignOutViewModel",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-9",
      source: "UserSignOutView",
      target: "UserSignOutViewModel",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-11",
      source: "UserSignOutInteractor",
      target: "Database",
      type: "DEPENDENCY",
      status: "INCORRECT_DEPENDENCY"
    },
    {
      id: "edge-12",
      source: "UserSignOutDataAccess",
      target: "Database",
      type: "DEPENDENCY",
      status: "VALID"
    }
  ]
};

export const mockViolations = {
  violations: [
    {
      id: "v-101",
      type: "INCORRECT_DEPENDENCY",
      message: "Interactor depends directly on Database.",
      suggestion: "Introduce a Data Access Interface in the Application Business Rules layer.",
      related_node_ids: ["UserSignOutInteractor"],
      related_edge_id: "edge-11",
      file_context: {
        file: "src/use_cases/UserSignOutInteractor.java",
        line_number: 3,
        snippet: "import framework_drivers.Database;"
      }
    },
    {
      id: "v-102",
      type: "MISSING_COMPONENT",
      message: "Data Access Interface is missing from the use case layer.",
      suggestion: "Add UserSignOutDataAccessInterface and make DataAccess implement it.",
      related_node_ids: ["UserSignOutDataAccessInterface", "UserSignOutDataAccess"],
      related_edge_id: "edge-10"
    },
    {
      id: "v-103",
      type: "LAYER_BREACH",
      message: "Presenter imports framework code directly.",
      suggestion: "Presenter should only depend on output boundary and view model.",
      related_node_ids: ["UserSignOutPresenter"],
      file_context: {
        file: "src/interface_adapters/UserSignOutPresenter.java",
        line_number: 3,
        snippet: "import framework_drivers.Database;"
      }
    },
    {
      id: "v-104",
      type: "MUTABLE_VIEW_STATE",
      message: "View model exposes mutable state map, increasing coupling with view layer.",
      suggestion: "Expose immutable state snapshots or dedicated getters instead of mutable maps.",
      related_node_ids: ["UserSignOutViewModel"],
      file_context: {
        file: "src/interface_adapters/UserSignOutViewModel.java",
        line_number: 6,
        snippet: "private final java.util.Map<String, String> state = new java.util.HashMap<>();"
      }
    }
  ]
};