"use client";

import { useEffect, useState } from "react";
import { getReviewStatistics, type ReviewStatistics } from "@/lib/fsrsStorage";
import { getStudyStats } from "@/lib/fsrsScheduler";

interface ReviewStatsProps {
  currentGrade: number;
}

export default function ReviewStats({ currentGrade }: ReviewStatsProps) {
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [studyStats, setStudyStats] = useState<ReturnType<typeof getStudyStats> | null>(null);

  useEffect(() => {
    // Load statistics
    const loadStats = () => {
      const reviewStats = getReviewStatistics(currentGrade);
      const study = getStudyStats(currentGrade);
      setStats(reviewStats);
      setStudyStats(study);
    };

    loadStats();

    // Refresh stats every 5 seconds to catch updates
    const interval = setInterval(loadStats, 5000);

    return () => clearInterval(interval);
  }, [currentGrade]);

  // Show loading state while stats are being fetched
  if (!stats || !studyStats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          学習状況
        </h2>
        <div className="text-gray-500 text-center py-8">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        学習状況
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Due Today */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">今日の復習</div>
          <div className="text-3xl font-bold text-red-700">{studyStats.dueToday}</div>
          <div className="text-xs text-red-500 mt-1">問</div>
        </div>

        {/* Total Reviews */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium mb-1">総復習数</div>
          <div className="text-3xl font-bold text-blue-700">{stats.totalReviews}</div>
          <div className="text-xs text-blue-500 mt-1">回</div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">正答率</div>
          <div className="text-3xl font-bold text-green-700">
            {stats.totalReviews > 0 ? Math.round(stats.successRate) : 0}%
          </div>
          <div className="text-xs text-green-500 mt-1">
            {stats.correctReviews}/{stats.totalReviews}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium mb-1">連続日数</div>
          <div className="text-3xl font-bold text-purple-700">{stats.streakDays}</div>
          <div className="text-xs text-purple-500 mt-1">日</div>
        </div>
      </div>

      {/* Card Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">新規カード</div>
          <div className="text-xl font-bold text-gray-700">{studyStats.newCards}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="text-xs text-orange-600 mb-1">学習中</div>
          <div className="text-xl font-bold text-orange-700">{studyStats.learning}</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-blue-600 mb-1">復習カード</div>
          <div className="text-xl font-bold text-blue-700">{studyStats.review}</div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <div className="text-xs text-indigo-600 mb-1">総カード数</div>
          <div className="text-xl font-bold text-indigo-700">{studyStats.total}</div>
        </div>
      </div>

      {/* Last Review Info */}
      {stats.lastReviewDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            最終復習: {new Date(stats.lastReviewDate).toLocaleString('ja-JP', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
}
