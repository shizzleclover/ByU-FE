'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { Hairline } from '@/components/editorial/Hairline'
import { apiGet } from '@/lib/api'
import type { AnalyticsOverview } from '@/types/api'

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiGet<AnalyticsOverview>('/analytics/overview'),
  })

  return (
    <>
      <DashboardTopbar title="Analytics" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-bg-sunken animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-line">
              {[
                { label: 'TOTAL VIEWS', value: data?.totalViews ?? 0 },
                { label: 'VIEWS (7D)', value: data?.viewsLast7d ?? 0 },
                { label: 'VIEWS (30D)', value: data?.viewsLast30d ?? 0 },
                { label: 'OUTREACH (30D)', value: data?.outreachClicksLast30d ?? 0 },
              ].map((s) => (
                <div key={s.label} className="border-r border-b border-line p-6">
                  <p className="text-overline text-ink-muted">{s.label}</p>
                  <p className="text-h2 font-bold text-ink mt-2">{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <Hairline />

            {/* Outreach by type */}
            {data?.outreachBreakdown && data.outreachBreakdown.length > 0 && (
              <div>
                <p className="text-overline text-ink-muted mb-6">OUTREACH BY CONTACT TYPE</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.outreachBreakdown} barSize={20}>
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#6E6E69' }} axisLine={{ stroke: '#E6E5DF' }} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#FAFAF7', border: '1px solid #E6E5DF', borderRadius: 0 }} />
                    <Bar dataKey="count" fill="#0F0F0E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top projects */}
            {data?.topProjects && data.topProjects.length > 0 && (
              <div>
                <p className="text-overline text-ink-muted mb-4">TOP PROJECTS</p>
                <div className="divide-y divide-line">
                  {data.topProjects.map((p) => (
                    <div key={p.slug} className="py-3">
                      <p className="text-meta text-ink">{p.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top stories */}
            {data?.topStories && data.topStories.length > 0 && (
              <div>
                <p className="text-overline text-ink-muted mb-4">TOP STORIES</p>
                <div className="divide-y divide-line">
                  {data.topStories.map((s) => (
                    <div key={s.slug} className="flex items-center justify-between py-3">
                      <p className="text-meta text-ink">{s.title}</p>
                      <p className="text-meta text-ink-muted">{s.viewCount.toLocaleString()} views</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
