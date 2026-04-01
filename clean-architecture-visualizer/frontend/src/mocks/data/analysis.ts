export const mockAnalysisSummary = {
  project_name: "CSC207 Project", 
  total_use_cases: 4, 
  total_violations: 6, 
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
  interaction_name: "Sign Out",
  nodes: [
    {
      id: "usecasename-UserSignOutController",
      name: "Controller",
      type: "Controller",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/UserSignOutController.java",
      status: "VALID"
    },
    {
      id: "Entities",
      name: "Entities",
      type: "Entity",
      layer: "EnterpriseBusinessRules",
      status: "MISSING"
    },
    {
      id: "UserSignOutPresenter",
      name: "Presenter",
      type: "Presenter",
      layer: "InterfaceAdapters",
      status: "VIOLATION"
    },
    {
      id: "UserSignOutViewModel",
      name: "View Model",
      type: "ViewModel",
      layer: "InterfaceAdapters",
      status: "VIOLATION"
    },
    {
      id: "UserSignOutInputBoundary",
      name: "Input Boundary",
      type: "InputBoundary",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "UserSignOutInputData",
      name: "Input Data",
      type: "InputData",
      layer: "ApplicationBusinessRules",
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
      status: "VALID"
    },
    {
      id: "UserSignOutOutputData",
      name: "Output Data",
      type: "OutputData",
      layer: "ApplicationBusinessRules",
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
      source: "UserSignOutInteractor",
      target: "Database",
      type: "DEPENDENCY",
      status: "VIOLATION"
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
      related_edge_id: "edge-2",
      file_context: {
        file: "UserSignOutInteractor.java",
        line_number: 12,
        snippet: "import framework_drivers.Database;"
      }
    }
  ]
};