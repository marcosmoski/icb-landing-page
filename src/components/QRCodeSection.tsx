import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

const QRCodeSection: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [activoToken, setActivoToken] = useState('');
  const epcQrRef = useRef<HTMLCanvasElement>(null);
  const activoQrRef = useRef<HTMLCanvasElement>(null);

  const buildEpc = (amount: string) => {
    const lines = [
      "BCD",
      "003", 
      "1",
      "SCT",
      "",
      "CONTA ECONOMIA SOCIAL",
      "PT50003604079910602581786",
      amount ? `EUR${Number(amount).toFixed(2)}` : "",
      "CHAR",
      "",
      "DONATION",
      ""
    ];
    return lines.join("\r\n") + "\r\n";
  };

  const generateEpcQR = useCallback(async () => {
    if (!epcQrRef.current) return;
    
    const payload = buildEpc(amount);
    try {
      await QRCode.toCanvas(epcQrRef.current, payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erro ao gerar QR EPC:', error);
    }
  }, [amount]);

  const generateActivoQR = useCallback(async () => {
    if (!activoQrRef.current) return;
    
    const text = activoToken.trim() || "li/EXEMPLO_COLE_O_TOKEN_AQUI";
    try {
      await QRCode.toCanvas(activoQrRef.current, text, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Erro ao gerar QR Activo:', error);
    }
  }, [activoToken]);

  const downloadQR = (canvasRef: React.RefObject<HTMLCanvasElement | null>, filename: string) => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  useEffect(() => {
    generateEpcQR();
  }, [amount]);

  useEffect(() => {
    generateActivoQR();
  }, [activoToken]);

  return (
    <section className="grid gap-6">
      {/* QR SEPA / EPC */}
      <div className="card bg-white rounded-3xl p-5 text-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">QR SEPA / EPC (transferência bancária)</h3>
            <p className="text-gray-600 text-sm">Compatível com Millennium BCP, Santander, CGD e outros.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Valor (opcional)</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="ex.: 10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-28 px-2 py-1 rounded-lg border border-gray-300"
            />
            <button 
              onClick={generateEpcQR}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
        <div className="mt-4 border rounded-2xl p-4 grid place-items-center">
          <canvas 
            ref={epcQrRef}
            className="w-[320px] h-[320px] md:w-[380px] md:h-[380px]"
          />
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Se não reconhecer, tente sem valor ou copie o IBAN.
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => downloadQR(epcQrRef, 'qr-epc.png')}
            className="px-3 py-1.5 bg-gray-100 rounded-xl border hover:bg-gray-200 transition-colors"
          >
            Descarregar PNG
          </button>
        </div>
      </div>

      {/* QR ActivoBank */}
      <div className="card bg-white rounded-3xl p-5 text-gray-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">QR ActivoBank</h3>
            <p className="text-gray-600 text-sm">Para quem usa ActivoBank (token proprietário).</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Cole aqui o token li/..."
              value={activoToken}
              onChange={(e) => setActivoToken(e.target.value)}
              className="w-[360px] max-w-[48vw] px-2 py-1 rounded-lg border border-gray-300"
            />
            <button 
              onClick={generateActivoQR}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
        <div className="mt-4 border rounded-2xl p-4 grid place-items-center">
          <canvas 
            ref={activoQrRef}
            className="w-[320px] h-[320px] md:w-[380px] md:h-[380px]"
          />
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Esse QR funciona apenas no app ActivoBank, pois o conteúdo é resolvido no servidor deles.
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            onClick={() => downloadQR(activoQrRef, 'qr-activo.png')}
            className="px-3 py-1.5 bg-gray-100 rounded-xl border hover:bg-gray-200 transition-colors"
          >
            Descarregar PNG
          </button>
        </div>
      </div>
    </section>
  );
};

export default QRCodeSection;
