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
        { interaction_id: "uc4in1", interaction_name: "Registration Flow" },
        { interaction_id: "uc4in2", interaction_name: "Standard User Onboarding (Silly Goose Variant)" },
        { interaction_id: "uc4in3", interaction_name: "Provision Honk-Enabled Profile" },
        { interaction_id: "uc4in4", interaction_name: "Activate Playful Persona Flag" },
        { interaction_id: "uc4in5", interaction_name: "Initialize User With Goose Traits" },
        { interaction_id: "uc4in6", interaction_name: "Register Goose Mode User" }
      ]
    }
  ]
};

export const mockInteractionDetails = {
  interaction_name: "Standard User Onboarding (Silly Goose Variant)",
  nodes: [
    {
      id: "GooseUserController",
      name: "Goose User Controller",
      type: "Controller",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/GooseUserController.java",
      status: "VALID"
    },
    {
      id: "GooseEntity",
      name: "Goose Entity",
      type: "Entity",
      layer: "EnterpriseBusinessRules",
      status: "VALID"
    },
    {
      id: "GoosePresenter",
      name: "Goose Presenter",
      type: "Presenter",
      layer: "InterfaceAdapters",
      status: "VIOLATION"
    },
    {
      id: "GooseViewModel",
      name: "Goose View Model",
      type: "ViewModel",
      layer: "InterfaceAdapters",
      status: "VIOLATION"
    },
    {
      id: "GooseInputBoundary",
      name: "Input Boundary",
      type: "InputBoundary",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "GooseInputData",
      name: "Input Data",
      type: "InputData",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "GooseInteractor",
      name: "Use Case Interactor",
      type: "Interactor",
      layer: "ApplicationBusinessRules",
      file_path: "src/use_cases/GooseUserOnboardingInteractor.java",
      status: "VIOLATION"
    },
    {
      id: "GooseOutputBoundary",
      name: "Output Boundary",
      type: "OutputBoundary",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "GooseOutputData",
      name: "Output Data",
      type: "OutputData",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "GooseDataAccessInterface",
      name: "Data Access Interface",
      type: "DataAccessInterface",
      layer: "ApplicationBusinessRules",
      status: "VALID"
    },
    {
      id: "GooseView",
      name: "Goose View",
      type: "View",
      layer: "Frameworks",
      file_path: "src/views/GooseUserView.java",
      status: "VALID"
    },
    {
      id: "GooseDataAccess",
      name: "Goose Data Access",
      type: "DataAccess",
      layer: "Frameworks",
      file_path: "src/framework_drivers/GooseDataAccess.java",
      status: "VALID"
    },
    {
      id: "GooseDatabase",
      name: "Database",
      type: "Database",
      layer: "Frameworks",
      file_path: "src/framework_drivers/GooseDatabase.java",
      status: "VALID"
    },
    {
      id: "LegacyFeatureToggleService",
      name: "Legacy Feature Toggle Service",
      type: "DataAccess",
      layer: "Frameworks",
      file_path: "src/framework_drivers/LegacyFeatureToggleService.java",
      status: "VIOLATION"
    },
    {
      id: "GooseTelemetryController",
      name: "Telemetry Controller",
      type: "Controller",
      layer: "InterfaceAdapters",
      file_path: "src/interface_adapters/GooseTelemetryController.java",
      status: "VALID"
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "GooseUserController",
      target: "GooseInputBoundary",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-2",
      source: "GooseInteractor",
      target: "GooseDatabase",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-3",
      source: "GooseEntity",
      target: "GooseDatabase",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-4",
      source: "GooseView",
      target: "GooseEntity",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-5",
      source: "GoosePresenter",
      target: "GooseDatabase",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-6",
      source: "GooseUserController",
      target: "LegacyFeatureToggleService",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-7",
      source: "GooseTelemetryController",
      target: "GooseInteractor",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-8",
      source: "GooseDataAccess",
      target: "GooseInputBoundary",
      type: "DEPENDENCY",
      status: "VIOLATION"
    },
    {
      id: "edge-9",
      source: "GooseInteractor",
      target: "GooseOutputBoundary",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-10",
      source: "GooseOutputBoundary",
      target: "GoosePresenter",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-11",
      source: "GoosePresenter",
      target: "GooseViewModel",
      type: "DEPENDENCY",
      status: "VALID"
    },
    {
      id: "edge-12",
      source: "GooseViewModel",
      target: "GooseView",
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
      related_edge_id: "edge-2",
      file_context: {
        file: "UserSignOutInteractor.java",
        line_number: 12,
        snippet: "import framework_drivers.Database;"
      }
    }
  ]
};