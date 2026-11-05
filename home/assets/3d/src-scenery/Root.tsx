import React from 'react';
import { Composition } from 'remotion';
import { Scenery } from './Scenery';
export const Root: React.FC = () => (
  <Composition id="Scenery" component={Scenery} durationInFrames={360} fps={30} width={1280} height={720} />
);
