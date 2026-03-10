import { jest } from '@jest/globals';

import { APIPresenter } from "../../../src/interface_adapter/api/apiPresenter";
import { APIInteractor } from "../../../src/use_case/api/apiInteractor";
import { APIController } from "../../../src/interface_adapter/api/apiController";

describe('APIPresenter', () => {
  it('should return JSON stringified output data', () => {
    const mockOutputData = {
      getOutputData: jest.fn().mockReturnValue({ foo: 'bar' }),
    };

    const presenter = new APIPresenter(mockOutputData as any);
    const result = presenter.getOutputData();

    expect(result).toBe(JSON.stringify({ foo: 'bar' }, null, 2));
    expect(mockOutputData.getOutputData).toHaveBeenCalledTimes(1);
  });
});

describe('APIInteractor', () => {
  it('should set output data with node and layer info', async () => {
    const mockDB = {};
    const mockCleanArchAccess = {
      getNodeInfo: jest.fn().mockReturnValue([{ name: 'Controller' }]),
      getLayerInfo: jest.fn().mockReturnValue([{ layer: 'Use Case' }]),
    };
    const mockOutputData = {
      setOutputData: jest.fn(),
    };

    const interactor = new APIInteractor(
      mockDB as any,
      mockCleanArchAccess as any,
      mockOutputData as any
    );

    await interactor.getLearningMode();

    expect(mockCleanArchAccess.getNodeInfo).toHaveBeenCalled();
    expect(mockCleanArchAccess.getLayerInfo).toHaveBeenCalled();
    expect(mockOutputData.setOutputData).toHaveBeenCalledWith({
      component_definitions: [{ name: 'Controller' }],
      layer_info: [{ layer: 'Use Case' }],
    });
  });
});

describe('APIController', () => {
  it('should call getLearningMode on the input boundary', () => {
    const mockInputBoundary = {
      getLearningMode: jest.fn().mockResolvedValue(undefined),
    };

    const controller = new APIController(mockInputBoundary as any);
    controller.getLearningMode();

    expect(mockInputBoundary.getLearningMode).toHaveBeenCalledTimes(1);
  });
});
