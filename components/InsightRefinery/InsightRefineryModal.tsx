'use client'

import React from 'react'
import { Brain, MessageSquare } from 'lucide-react'

interface InsightRefineryModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: string
  reportTitle: string
  userId: string
  locale: 'en' | 'zh'
}

export default function InsightRefineryModal({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  userId,
  locale
}: InsightRefineryModalProps) {
  if (!isOpen) return null

  const isZh = locale === 'zh'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isZh ? 'Insight Refinery 洞察精炼器' : 'Insight Refinery'}
              </h2>
              <p className="text-xs text-gray-500">
                {isZh ? '基于您已生成的估值报告进行二次深度研究' : 'Deep-dive research based on your generated valuation report'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {isZh ? '当前分析对象' : 'Current report'}
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{reportTitle || reportId}</p>
            <p className="mt-1 text-xs text-gray-500">
              {isZh
                ? `报告 ID：${reportId}｜用户 ID：${userId}`
                : `Report ID: ${reportId} | User ID: ${userId}`}
            </p>
          </div>

          <div className="flex items-start space-x-3 rounded-xl border border-dashed border-purple-200 bg-purple-50 px-4 py-3">
            <MessageSquare className="mt-0.5 h-5 w-5 text-purple-500" />
            <div className="space-y-1 text-sm text-purple-900">
              <p className="font-medium">
                {isZh
                  ? '当前 Insight Refinery 交互界面尚未完全接入后端服务。'
                  : 'The interactive Insight Refinery experience is not fully wired to backend services yet.'}
              </p>
              <p className="text-purple-800">
                {isZh
                  ? '但您可以正常继续使用估值报告生成功能，后续我们会在这里接入对话式深度研究与版本迭代对比。'
                  : 'You can still use the valuation report generation as usual; this space will later host interactive deep research and version comparison.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px  -6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {isZh ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}


