import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function BeaconLoopIcon({ size = 64, dark = false }: { size?: number; dark?: boolean }) {
  const navy = dark ? '#FFFFFF' : '#0D1B2A';
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path d="M166 100 A180 180 0 1 1 166 412" stroke={navy} strokeWidth={46} strokeLinecap="round" fill="none"/>
      <Circle cx={346} cy={100} r={23} fill="#FF7A59"/>
      <Circle cx={436} cy={256} r={23} fill="#FF7A59"/>
      <Circle cx={346} cy={412} r={23} fill="#FF7A59"/>
      <Path d="M256 230 C236 230 220 246 220 266 C220 292 244 314 256 330 C268 314 292 292 292 266 C292 246 276 230 256 230 Z" fill="#FFFFFF" stroke={navy} strokeWidth={8}/>
    </Svg>
  );
}

