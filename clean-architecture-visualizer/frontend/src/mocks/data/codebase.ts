import { FileRelation, FileContent } from "../../lib";

export const mockFileTree = {
  id: "src",
  name: "src",
  type: "directory",
  path: "src/",
  children: [
    {
      id: "src/entity",
      name: "entity",
      type: "directory",
      path: "src/entity/",
      layer: "EnterpriseBusinessRules",
      children: [{ id: "src/entity/User.java", name: "User.java", type: "file", path: "src/entity/User.java", hasViolation: false }]
    },
    {
      id: "src/use_case",
      name: "use_case",
      type: "directory",
      path: "src/use_case/",
      layer: "ApplicationBusinessRules",
      children: [
        {
          id: "src/use_case/signup",
          name: "signup",
          type: "directory",
          path: "src/use_case/signup/",
          children: [
            { id: "src/use_case/signup/SignupInputBoundary.java", name: "SignupInputBoundary.java", type: "file", path: "src/use_case/signup/SignupInputBoundary.java", hasViolation: false },
            { id: "src/use_case/signup/SignupInputData.java", name: "SignupInputData.java", type: "file", path: "src/use_case/signup/SignupInputData.java", hasViolation: true }
          ]
        }
      ]
    },
    {
      id: "src/interface_adapter",
      name: "interface_adapter",
      type: "directory",
      path: "src/interface_adapter/",
      layer: "InterfaceAdapters",
      children: [
        {
          id: "src/interface_adapter/signup",
          name: "signup",
          type: "directory",
          path: "src/interface_adapter/signup/",
          children: [{ id: "src/interface_adapter/signup/SignupController.java", name: "SignupController.java", type: "file", path: "src/interface_adapter/signup/SignupController.java", hasViolation: false }]
        }
      ]
    },
    {
      id: "src/view",
      name: "view",
      type: "directory",
      path: "src/view/",
      children: [{ id: "src/view/LoginView.java", name: "LoginView.java", type: "file", path: "src/view/LoginView.java", hasViolation: false }]
    },
    {
      id: "src/data_access",
      name: "data_access",
      type: "directory",
      path: "src/data_access/",
      children: [{ id: "src/data_access/UserSignupDataAccessInterface.java", name: "UserSignupDataAccessInterface.java", type: "file", path: "src/data_access/UserSignupDataAccessInterface.java", hasViolation: false }]
    }
  ]
};

export const mockFiles: Record<string, FileContent> = {
  "src/entity/User.java": {
    file_path: "src/entity/User.java",
    content: `package entity;
import java.time.LocalDateTime;
public interface User {
    String getName();
    String getPassword();
    LocalDateTime getCreationTime();
}`,
    language: "java",
    layer: "EnterpriseBusinessRules",
    lines_with_violations: [], 
  },
  "src/use_case/signup/SignupInputBoundary.java": {
    file_path: "src/use_case/signup/SignupInputBoundary.java",
    content: `package use_case.signup;
public interface SignupInputBoundary {
    void execute(SignupInputData signupInputData);
}`,
    language: "java",
    layer: "ApplicationBusinessRules",
    lines_with_violations: [], 
  },
  "src/use_case/signup/SignupInputData.java": {
    file_path: "src/use_case/signup/SignupInputData.java",
    content: `package use_case.signup;

    import interface_adapter.signup.SignupController;

public class SignupInputData {
    final private String username;
    final private String password;
    final private String repeatPassword;
    public SignupInputData(String username, String password, String repeatPassword) {
        this.username = username;
        this.password = password;
        this.repeatPassword = repeatPassword;
    }
    String getUsername() { return username; }
    String getPassword() { return password; }
    public String getRepeatPassword() { return repeatPassword; }
}`,
    language: "java",
    layer: "ApplicationBusinessRules",
    lines_with_violations: [3], 
  },
  "src/interface_adapter/signup/SignupController.java": {
    file_path: "src/interface_adapter/signup/SignupController.java",
    content: `package interface_adapter.signup;

import use_case.signup.SignupInputBoundary;
import use_case.signup.SignupInputData;

public class SignupController {
    final SignupInputBoundary userSignupUseCaseInteractor;
    public SignupController(SignupInputBoundary userSignupUseCaseInteractor) {
        this.userSignupUseCaseInteractor = userSignupUseCaseInteractor;
    }

    public void execute(String username, String password1, String password2) {
        SignupInputData signupInputData = new SignupInputData(username, password1, password2);
        userSignupUseCaseInteractor.execute(signupInputData);
    }
}`,
    language: "java", 
    layer: "InterfaceAdapters",
    lines_with_violations: [] 
  },
  "src/data_access/UserSignupDataAccessInterface.java": {
    file_path: "src/data_access/UserSignupDataAccessInterface.java",
    content: `package data_access;
import entity.User;
public interface UserSignupDataAccessInterface {
    boolean existsByName(String identifier);
    void save(User user);
}`,
    language: "java",
    layer: "Frameworks",
    lines_with_violations: [] 
  },
  "src/view/LoginView.java": {
    file_path: "src/view/LoginView.java",
    content: `package view;

import interface_adapter.login.LoginState;
import interface_adapter.login.LoginViewModel;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

public class LoginView extends JPanel implements ActionListener, PropertyChangeListener {

    public final String viewName = "log in";
    private final LoginViewModel loginViewModel;

    /**
     * The username chosen by the user
     */
    final JTextField usernameInputField = new JTextField(15);
    private final JLabel usernameErrorField = new JLabel();
    /**
     * The password
     */
    final JPasswordField passwordInputField = new JPasswordField(15);
    private final JLabel passwordErrorField = new JLabel();

    final JButton logIn;
    final JButton cancel;

    /**
     * A window with a title and a JButton.
     */
    public LoginView(LoginViewModel loginViewModel) {
        this.loginViewModel = loginViewModel;
        this.loginViewModel.addPropertyChangeListener(this);

        JLabel title = new JLabel("Login Screen");
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        LabelTextPanel usernameInfo = new LabelTextPanel(
                new JLabel("Username"), usernameInputField);
        LabelTextPanel passwordInfo = new LabelTextPanel(
                new JLabel("Password"), passwordInputField);

        JPanel buttons = new JPanel();
        logIn = new JButton(loginViewModel.LOGIN_BUTTON_LABEL);
        buttons.add(logIn);
        cancel = new JButton(loginViewModel.CANCEL_BUTTON_LABEL);
        buttons.add(cancel);

        logIn.addActionListener(this);
        cancel.addActionListener(this);

        usernameInputField.addKeyListener(new KeyListener() {
            @Override
            public void keyTyped(KeyEvent e) {
                LoginState currentState = loginViewModel.getState();
                currentState.setUsername(usernameInputField.getText());
                loginViewModel.setState(currentState);
            }

            @Override
            public void keyPressed(KeyEvent e) {}

            @Override
            public void keyReleased(KeyEvent e) {}
        });
        this.setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));

        this.add(title);
        this.add(usernameInfo);
        this.add(usernameErrorField);
        this.add(passwordInfo);
        this.add(passwordErrorField);
        this.add(buttons);
    }

    /**
     * React to a button click that results in evt.
     */
    public void actionPerformed(ActionEvent evt) {
        System.out.println("Click " + evt.getActionCommand());
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt) {
        LoginState state = (LoginState) evt.getNewValue();
        setFields(state);
    }

    private void setFields(LoginState state) {
        usernameInputField.setText(state.getUsername());
        passwordInputField.setText(state.getPassword());
    }

}`,
    language: "java",
    layer: "Frameworks",
    lines_with_violations: [] 
  }
};


export const mockFileRelationsByPath: Record<string, FileRelation[]> = {
  "src/interface_adapter/signup/SignupController.java": [
    {
      type: "IMPORT",
     target_file: "src/use_case/signup/SignupInputData.java",
      line: 4,
      description: "Imports SignupInputData from controller arguments.",
      layer: "ApplicationBusinessRules",
    },
    {
      type: "INSTANTIATION",
      target_file: "src/use_case/signup/SignupInputBoundary.java",
      line: 7,
      description: "Instantiates SignInputBoundary",
      layer: "InterfaceAdapters",
    }
  ],
  "src/data_access/UserSignupDataAccessInterface.java": [
    {
      type: "DEPENDENCY",
      target_file: "src/entity/User.java",
      line: 2,
      description: "Depends on Entity/User interface.",
      layer: "EnterpriseBusinessRules",
    }
  ]
};