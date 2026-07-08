import { QRCodeSVG } from "qrcode.react";

type Props = {
  value: string;
  label: string;
};

export function QRCodeDisplay({ value, label }: Props) {
  return (
    <div className="qr-box">
      <QRCodeSVG value={value} size={168} level="M" includeMargin />
      <p>{label}</p>
    </div>
  );
}
