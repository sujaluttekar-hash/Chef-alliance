return (
  <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20 relative 
  bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 
  min-h-screen animate-in fade-in duration-700">

    {/* SUCCESS TOAST */}
    {successMessage && (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] 
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
      text-white px-8 py-4 rounded-full shadow-2xl animate-bounce">
        <span className="font-bold text-sm uppercase tracking-widest">
          {successMessage}
        </span>
      </div>
    )}

    {/* TABS */}
    <div className="flex items-center space-x-2 
    bg-white/70 backdrop-blur-xl p-2 rounded-2xl 
    border border-white/40 shadow-lg w-fit overflow-x-auto">

      {[
        { key: 'AUDIT', label: 'Quality Audits', icon: ClipboardCheck },
        { key: 'SUPERVISOR', label: 'Performance', icon: Trophy },
        { key: 'TRAINING', label: 'Training', icon: GraduationCap },
        { key: 'VILLA_AUDIT', label: 'Villa Audits', icon: Home },
        { key: 'MANAGEMENT', label: 'Management', icon: Settings2 }
      ].map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase rounded-xl transition-all
            ${activeTab === tab.key
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg scale-105'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-white/60'}
            `}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>

    {/* AUDIT TAB */}
    {activeTab === 'AUDIT' && (
      <div className="space-y-12">

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Audits Today"
            value={audits.filter(a => new Date(a.datetime).toDateString() === new Date().toDateString()).length}
            subtext="Entries" />

          <KpiCard title="Avg Score"
            value={`${performanceData.avgCompliance}%`}
            subtext="Compliance" />

          <KpiCard title="Villa Tasks"
            value={villaAudits.filter(v => v.status === 'PENDING').length}
            subtext="Pending" />

          <div className="rounded-[30px] p-6 text-white 
          bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
            <p className="text-[10px] uppercase opacity-60">Status</p>
            <h3 className="text-2xl font-black">Operational</h3>
          </div>
        </div>

        {/* CHART + AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CHART */}
          <div className="lg:col-span-2 
          bg-white/70 backdrop-blur-xl p-8 rounded-[30px] 
          border border-white/40 shadow-xl">

            <h3 className="font-black mb-6 text-sm uppercase">
              Squad Quality Index
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i}
                        fill={e.score >= 80 ? '#22c55e' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI PANEL */}
          <div className="rounded-[30px] p-8 text-white 
          bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 shadow-2xl">

            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Sparkles /> AI Insights
            </h3>

            <button
              onClick={handleAiInsight}
              className="w-full py-4 rounded-xl font-bold 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              Generate Trends
            </button>

            {aiInsight && (
              <div className="mt-6 text-xs opacity-80">
                {aiInsight}
              </div>
            )}
          </div>

        </div>
      </div>
    )}

  </div>
);
