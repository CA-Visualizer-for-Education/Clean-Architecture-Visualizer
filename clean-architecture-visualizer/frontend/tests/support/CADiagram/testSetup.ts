export const setRouteToInteractionDiagram = (
  mockUseParams: { mockReturnValue: (value: unknown) => void },
  mockUseLocation: { mockReturnValue: (value: unknown) => void },
) => {
  mockUseParams.mockReturnValue({ interactionId: 'uc2in1' });
  mockUseLocation.mockReturnValue({ pathname: '/use-case/uc-2/interaction/uc2in1/diagram' });
};

export const setRouteToLearningMode = (
  mockUseParams: { mockReturnValue: (value: unknown) => void },
  mockUseLocation: { mockReturnValue: (value: unknown) => void },
) => {
  mockUseParams.mockReturnValue({ interactionId: undefined });
  mockUseLocation.mockReturnValue({ pathname: '/learning' });
};

export const setDefaultInteractionHookState = (
  mockUseInteraction: { mockReturnValue: (value: unknown) => void },
) => {
  mockUseInteraction.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
  });
};

export const installResizeObserverMock = (mockFn: () => unknown) => {
  class ResizeObserverMock {
    observe = mockFn;
    unobserve = mockFn;
    disconnect = mockFn;
  }

  global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
};
