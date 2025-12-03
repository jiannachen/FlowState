import React, { useState } from 'react';
import { Button } from './Button';
import { StrengthsConfig } from '../types';

interface StrengthsConfigManagerProps {
  currentConfig: StrengthsConfig | null;
  onSave: (config: StrengthsConfig) => void;
  onBack: () => void;
}

export const StrengthsConfigManager: React.FC<StrengthsConfigManagerProps> = ({
  currentConfig,
  onSave,
  onBack,
}) => {
  const [strengthsRawText, setStrengthsRawText] = useState(
    currentConfig?.strengthsRawText || ''
  );
  const [topStrengthsInput, setTopStrengthsInput] = useState(
    currentConfig?.topStrengths.join(', ') || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!strengthsRawText.trim()) {
      alert('请输入完整的34项优势内容');
      return;
    }

    const topStrengthsArray = topStrengthsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (topStrengthsArray.length === 0) {
      alert('请至少输入一个优势特质');
      return;
    }

    setIsSaving(true);
    try {
      const config: StrengthsConfig = {
        id: currentConfig?.id || `config-${Date.now()}`,
        strengthsRawText: strengthsRawText.trim(),
        topStrengths: topStrengthsArray,
        createdAt: currentConfig?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await onSave(config);
      alert('优势配置已保存');
    } catch (error) {
      console.error('保存失败', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-morandi-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2">34项优势配置</h1>
            <p className="text-stone-600">配置你的盖洛普优势特质</p>
          </div>
          <Button onClick={onBack} variant="secondary">
            返回菜单
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 space-y-6">
          {/* 完整优势文本 */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              完整的34项优势内容
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-stone-500 mb-3">
              将你的盖洛普优势测评完整结果粘贴在这里。系统会使用这些信息来生��个性化的任务计划。
            </p>
            <textarea
              value={strengthsRawText}
              onChange={e => setStrengthsRawText(e.target.value)}
              className="w-full h-64 px-4 py-3 rounded-lg border border-stone-300 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 outline-none transition-all resize-none font-mono text-sm"
              placeholder="例如：&#10;1. 战略 (Strategic)&#10;你能够从纷繁复杂中看到规律...&#10;&#10;2. 学习 (Learner)&#10;你热爱学习，渴望持续提升...&#10;&#10;..."
            />
          </div>

          {/* Top 优势列表 */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              核心优势（Top 5-10）
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-stone-500 mb-3">
              输入你最突出的优势特质，用逗号分隔（例如：战略, 学习, 思维, 前瞻, 责任）
            </p>
            <input
              type="text"
              value={topStrengthsInput}
              onChange={e => setTopStrengthsInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 outline-none transition-all"
              placeholder="战略, 学习, 思维, 前瞻, 责任"
            />
          </div>

          {/* 预览区 */}
          {topStrengthsInput && (
            <div className="bg-stone-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-stone-600 mb-2">预览核心优势：</p>
              <div className="flex flex-wrap gap-2">
                {topStrengthsInput
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s.length > 0)
                  .map((strength, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-stone-300 rounded-full text-sm text-stone-700"
                    >
                      {strength}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <Button onClick={onBack} variant="secondary" disabled={isSaving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : currentConfig ? '更新配置' : '保存配置'}
            </Button>
          </div>

          {/* 提示信息 */}
          {!currentConfig && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>首次配置：</strong>完成配置后，每次创建任务时系统都会引用这些优势信息。
                你可以随时回到这里更新配置。
              </p>
            </div>
          )}

          {currentConfig && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>配置已存在：</strong>
                上次更新时间：{new Date(currentConfig.updatedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
