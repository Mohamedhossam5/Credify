export const simulateKycProcessing = async (): Promise<void> => {
  await new Promise(r => setTimeout(r, 480));
};

export const simulateKycResult = (): boolean => {
  return Math.random() < 0.6;
};
