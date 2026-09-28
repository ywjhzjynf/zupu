import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Upload,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Family, FamilyMember, GenerationOrder } from '../../types/genealogy';

interface ExportGenealogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
  members: FamilyMember[];
  generationOrders: GenerationOrder[];
  onImportMembers: (importedMembers: any[]) => Promise<void>;
}

export const ExportGenealogyModal: React.FC<ExportGenealogyModalProps> = ({
  isOpen,
  onClose,
  family,
  members,
  generationOrders,
  onImportMembers,
}) => {
  const [styleMode, setStyleMode] = useState<'su_style' | 'ou_style'>('su_style');
  const [activeTab, setActiveTab] = useState<'print' | 'json' | 'csv'>('print');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importedJsonText, setImportedJsonText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen || !family) return null;

  // Group members by generation for Su-style and Ou-style chart rendering
  const maxGen = Math.max(...members.map((m) => m.generationNum), 1);
  const genMembersMap = new Map<number, FamilyMember[]>();
  for (let g = 1; g <= maxGen; g++) {
    genMembersMap.set(
      g,
      members.filter((m) => m.generationNum === g)
    );
  }

  // Generate and Download Real .pdf file using html2canvas & jsPDF
  const handleGeneratePDF = async () => {
    const targetEl = document.getElementById('printable-genealogy');
    if (!targetEl) return;

    setIsExportingPDF(true);
    setExportSuccess(false);

    try {
      // Capture element with html2canvas in high DPI
      const canvas = await html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FDFBF7',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content spans beyond 1 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Download real .pdf file directly
      const pdfFileName = `${family.name}_${styleMode === 'su_style' ? '苏式' : '欧式'}宣纸族谱.pdf`;
      pdf.save(pdfFileName);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert('PDF 生成失败，请重试或尝试简化内容。');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Browser print fallback
  const handlePrint = () => {
    window.print();
  };

  // Download JSON backup
  const handleDownloadJSON = () => {
    const backupData = {
      family,
      generationOrders,
      members,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${family.name}_数字族谱全备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV table
  const handleDownloadCSV = () => {
    const headers = ['世代', '字辈', '姓名', '曾用名', '性别', '出生日期', '生卒', '籍贯', '现居地', '职业', '生平'];
    const rows = members.map((m) => [
      `第${m.generationNum}世`,
      m.generationChar || '',
      m.name,
      m.usedName || '',
      m.gender === 'male' ? '男' : '女',
      m.birthDate || '',
      m.isDeceased ? '已故' : '健在',
      m.birthPlace || '',
      m.livingPlace || '',
      m.occupation || '',
      `"${(m.biography || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${family.name}_成员档案名册.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle JSON Import
  const handleImportJSON = async () => {
    try {
      const parsed = JSON.parse(importedJsonText);
      if (Array.isArray(parsed.members)) {
        await onImportMembers(parsed.members);
        setImportStatus('备份数据解析成功，已导入成员！');
      } else if (Array.isArray(parsed)) {
        await onImportMembers(parsed);
        setImportStatus('成功导入成员数据！');
      } else {
        setImportStatus('格式错误，请贴入有效的族谱 JSON 数据');
      }
    } catch (err: any) {
      setImportStatus('格式错误：' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-2xl w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#8B5A2B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4A359]" />
            <h2 className="font-bold font-serif text-base">族谱全本导出与传统宣纸 PDF 渲染下载</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-white border-b border-[#E8DFD1] flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('print')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'print' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileDown className="w-4 h-4 text-[#D4A359]" />
            <span>生成并导出真实 .PDF 族谱文件</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'json' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>全量 JSON 备份与恢复</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'csv' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV 导出与导入</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-[#1A1A1A]">
          {activeTab === 'print' && (
            <div className="space-y-4">
              {/* Style Selector & Export Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-[#E8DFD1]">
                <span className="font-semibold text-gray-700">族谱规制：</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStyleMode('su_style')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      styleMode === 'su_style'
                        ? 'border-[#B83B26] bg-[#B83B26]/10 text-[#B83B26]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    苏式族谱 (横行世系，五代一图)
                  </button>
                  <button
                    onClick={() => setStyleMode('ou_style')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      styleMode === 'ou_style'
                        ? 'border-[#B83B26] bg-[#B83B26]/10 text-[#B83B26]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    欧式族谱 (垂下世系，旁记功名)
                  </button>
                </div>
              </div>

              {/* PDF Action Button Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isExportingPDF}
                  className="bg-[#B83B26] hover:bg-[#8B5A2B] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在高清渲染排版并生成 PDF...</span>
                    </>
                  ) : exportSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span>PDF 族谱文件已下载成功！</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>下载宣纸风 {styleMode === 'su_style' ? '苏式' : '欧式'} .PDF 族谱</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>系统直接调用打印机</span>
                </button>
              </div>

              {/* Printable Genealogy Preview Box */}
              <div
                id="printable-genealogy"
                className="bg-[#FDFBF7] p-8 border-2 border-[#8B5A2B] rounded-2xl shadow-inner font-serif space-y-6 text-[#1A1A1A]"
              >
                {/* Title Header */}
                <div className="text-center border-b-2 border-[#8B5A2B] pb-4">
                  <span className="seal-badge text-[#B83B26] border-[#B83B26] text-xs mb-2">
                    {family.hallName || '陇西堂'}
                  </span>
                  <h1 className="text-2xl font-bold font-serif tracking-widest text-[#1A1A1A] my-2">
                    《{family.name}》
                  </h1>
                  <p className="text-xs text-[#8B5A2B]">
                    始祖祖籍：{family.ancestralHome || '中国'} · 全家族共记 {members.length} 人 · 世传 {maxGen} 代
                  </p>
                </div>

                {/* Render Su-style Chart */}
                {styleMode === 'su_style' && (
                  <div className="space-y-4">
                    {Array.from({ length: maxGen }).map((_, i) => {
                      const genNum = i + 1;
                      const genMembers = genMembersMap.get(genNum) || [];
                      const genCharObj = generationOrders.find((g) => g.generationNum === genNum);

                      return (
                        <div key={genNum} className="border border-[#D9CDB8] rounded-xl p-3 bg-white">
                          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-1.5 mb-2 font-bold text-xs text-[#8B5A2B]">
                            <span>
                              第 {genNum} 世 {genCharObj ? `· [${genCharObj.character}]字辈` : ''}
                            </span>
                            <span className="text-[10px] text-gray-400">本世共 {genMembers.length} 位宗亲</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {genMembers.map((m) => (
                              <div key={m.id} className="p-2 bg-[#FDFBF7] rounded-lg border border-[#E8DFD1]">
                                <div className="font-bold text-[#1A1A1A] flex items-center justify-between">
                                  <span>{m.name}</span>
                                  <span className="text-[10px] text-gray-500 font-normal">
                                    {m.gender === 'male' ? '男' : '女'} · {m.isDeceased ? '已故' : '健在'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#666666] mt-1 leading-relaxed">
                                  {m.biography || '生平记载祥和完备。'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Render Ou-style Chart */}
                {styleMode === 'ou_style' && (
                  <div className="space-y-3 divide-y divide-[#E8DFD1]">
                    {members.map((m) => (
                      <div key={m.id} className="pt-2 flex items-start justify-between text-xs">
                        <div className="font-bold text-[#8B5A2B] w-20">第 {m.generationNum} 世</div>
                        <div className="flex-1 font-bold text-[#1A1A1A]">{m.name}</div>
                        <div className="flex-1 text-[#666666]">{m.livingPlace || m.birthPlace || '住址未记'}</div>
                        <div className="flex-1 text-[#8B5A2B]">{m.occupation || '功名未记'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] space-y-3">
                <h3 className="font-bold text-sm text-[#1A1A1A]">导出家族全量 JSON 数据备份</h3>
                <p className="text-xs text-gray-500">
                  包含家族基本信息、字辈谱系、全体成员档案及亲子关系链条。
                </p>
                <button
                  onClick={handleDownloadJSON}
                  className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 .json 数据文件</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] space-y-3">
                <h3 className="font-bold text-sm text-[#1A1A1A]">通过 JSON 备份恢复/导入家族数据</h3>
                <textarea
                  rows={5}
                  placeholder="在此贴入之前导出的族谱 JSON 字符串..."
                  value={importedJsonText}
                  onChange={(e) => setImportedJsonText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D9CDB8] focus:outline-none focus:border-[#8B5A2B] font-mono"
                />
                {importStatus && <p className="text-xs font-semibold text-[#B83B26]">{importStatus}</p>}
                <button
                  onClick={handleImportJSON}
                  disabled={!importedJsonText.trim()}
                  className="bg-[#B83B26] hover:bg-[#8B5A2B] text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>解析并导入成员数据</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] space-y-3">
                <h3 className="font-bold text-sm text-[#1A1A1A]">导出成员花名册表格 (.csv)</h3>
                <p className="text-xs text-gray-500">
                  可以导出为 Excel 兼容的表格，方便在电脑上整理批注。
                </p>
                <button
                  onClick={handleDownloadCSV}
                  className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>导出成员名册 CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
