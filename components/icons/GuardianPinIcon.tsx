import React from 'react';
import Svg, { Mask, Rect, G, Path, Circle } from 'react-native-svg';

export default function GuardianPinIcon({ size = 64 }: { size?: number }) {
  const stroke = 0.08 * 512; // ~41
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Mask id="neg-space">
        <Rect x={0} y={0} width={512} height={512} fill="white" />
        <Path d="M256 200 C232 200 214 218 214 242 C214 274 242 302 256 324 C270 302 298 274 298 242 C298 218 280 200 256 200 Z" fill="black"/>
        <Circle cx={256} cy={168} r={18} fill="black"/>
      </Mask>
      <G mask="url(#neg-space)">
        <Path d="M256 32 C 353 32 432 111 432 208 C 432 322 320 410 266 472 C 263 475 249 475 246 472 C 192 410 80 322 80 208 C 80 111 159 32 256 32 Z" fill="#00A7A7" stroke="#1E1E1E" strokeWidth={stroke} strokeLinejoin="round"/>
      </G>
    </Svg>
  );
}

