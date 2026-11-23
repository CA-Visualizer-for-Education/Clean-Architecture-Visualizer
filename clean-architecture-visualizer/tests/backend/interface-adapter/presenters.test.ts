import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { CreateModuleUseCasePresenter } from '../../../src/interface_adapter/CreateModuleUseCase/createModuleUseCasePresenter.js';
import { CreateFeaturePresenter } from '../../../src/interface_adapter/createFeature/createFeaturePresenter.js';
import { CreateUseCasePresenter } from '../../../src/interface_adapter/createUseCase/createUseCasePresenter.js';
import { GraphVerificationPresenter } from '../../../src/interface_adapter/graphVerification/graphVerificationPresenter.js';
import { CreateFeatureOutputData } from '../../../src/use_case/createFeature/createFeatureOutputData.js';
import { CreateModuleUseCaseOutputData } from '../../../src/use_case/createModuleUseCase/createModuleUseCaseOutputData.js';
import { CreateUseCaseOutputData } from '../../../src/use_case/createUseCase/createUseCaseOutputData.js';
import { GraphVerificationOutputData } from '../../../src/use_case/graphVerification/graphVerificationOutputData.js';

// The presenter, not the interactor, decides which view to show from the
// output data it is given.
describe('Presenters choose the view from the output data', () => {
  let log: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    log = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  function printed(): string {
    return log.mock.calls.map((args) => String(args[0])).join('\n');
  }

  describe('CreateFeaturePresenter', () => {
    it('shows the success view when the output data has no error', () => {
      const outputData = new CreateFeatureOutputData();
      outputData.setFeature('Grading');
      const presenter = new CreateFeaturePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain('Feature Grading has been created.');
      expect(presenter.getError()).toBeNull();
    });

    it('shows the fail view when the output data has an error', () => {
      const outputData = new CreateFeatureOutputData();
      outputData.setError('This feature already exists.');
      const presenter = new CreateFeaturePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain('This feature already exists.');
      expect(printed()).not.toContain('has been created');
      expect(presenter.getError()).toBe('This feature already exists.');
    });
  });

  describe('CreateUseCasePresenter', () => {
    it('shows the success view when the output data has no error', () => {
      const outputData = new CreateUseCaseOutputData();
      outputData.setUseCase('Login');
      const presenter = new CreateUseCasePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain('Usecase Login has been created.');
      expect(presenter.getError()).toBeNull();
    });

    it('shows the fail view when the output data has an error', () => {
      const outputData = new CreateUseCaseOutputData();
      outputData.setError('Use case already exists.');
      const presenter = new CreateUseCasePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain('Use case already exists.');
      expect(printed()).not.toContain('has been created');
      expect(presenter.getError()).toBe('Use case already exists.');
    });
  });

  describe('CreateModuleUseCasePresenter', () => {
    it('shows the success view when the output data has no error', () => {
      const outputData = new CreateModuleUseCaseOutputData();
      outputData.setFeature('Enrollment');
      outputData.setUseCase('DropStudent');
      const presenter = new CreateModuleUseCasePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain(
        'Usecase DropStudent in feature Enrollment has been created.'
      );
      expect(presenter.getError()).toBeNull();
    });

    it('shows the fail view when the output data has an error', () => {
      const outputData = new CreateModuleUseCaseOutputData();
      outputData.setError('The input usecase already exists.');
      const presenter = new CreateModuleUseCasePresenter(outputData);

      presenter.execute();

      expect(printed()).toContain('The input usecase already exists.');
      expect(printed()).not.toContain('has been created');
      expect(presenter.getError()).toBe('The input usecase already exists.');
    });
  });

  describe('GraphVerificationPresenter', () => {
    it('prints every line of the output data', () => {
      const outputData = new GraphVerificationOutputData();
      outputData.setOutputData(['✓ login', '✗ logout'], [true, false]);

      new GraphVerificationPresenter(outputData).execute();

      expect(log).toHaveBeenCalledTimes(2);
      expect(printed()).toContain('login');
      expect(printed()).toContain('logout');
    });
  });
});
