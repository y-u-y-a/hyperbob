import React from 'react';
import { OnboardingComponent, OnboardingComponentProps } from '../types';

// NOTE: アカウントカスタム画面は不要なので関数のみ実行する
const Onboarding: OnboardingComponent = ({
  onOnboardingComplete,
}: OnboardingComponentProps) => {
  onOnboardingComplete();
  return <></>;
};

export default Onboarding;
