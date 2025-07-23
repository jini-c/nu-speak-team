import Image from 'next/image';

type NuSpeakLogoProps = {
  size?: number; // 로고 크기
  showText?: boolean; // 텍스트 표시 여부 (이미지에 포함되어 있으므로 무시됨)
};

export default function NuSpeakLogo({ size = 40, showText = true }: NuSpeakLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Image
        src="/logo.png"
        alt="nu:speak"
        width={size * 2.5} // 텍스트가 포함된 로고이므로 더 넓게
        height={size}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
} 