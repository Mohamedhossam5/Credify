import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import type { Payment } from '../../hooks/useTransactions';
import FloatingSelect from '../../components/ui/FloatingSelect';

import toast from 'react-hot-toast';

const Transactions: React.FC = () => {
  const { 
    history, 
    isLoadingHistory, 
    txFilter, 
    setTxFilter,
    txCategory,
    setTxCategory, 
    txSearchQuery, 
    setTxSearchQuery 
  } = useTransactions();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxSearchQuery(e.target.value);
  };

  const handleExport = () => {
    if (history.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    // Clean XML strings to prevent syntax breakages
    const escapeXml = (str: string) => {
      if (!str) return "";
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const xmlHeader = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Credify User</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#374151"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="16" ss:Bold="1" ss:Color="#0F766E"/>
  </Style>
  <Style ss:ID="Meta">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="9" ss:Italic="1" ss:Color="#6B7280"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
   </Borders>
  </Style>
  <Style ss:ID="CellNormal">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="CellAlternate">
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="AmountStyle">
   <Alignment ss:Horizontal="Right"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="AmountStyleAlt">
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Right"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusCompleted">
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#15803D" ss:Bold="1"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Transaction History">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="150"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="150"/>
   <Row ss:Height="26">
    <Cell ss:StyleID="Title"><Data ss:Type="String">Credify Bank - Transaction History</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:StyleID="Meta"><Data ss:Type="String">Exported on: ${new Date().toLocaleString()}</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:StyleID="Meta"><Data ss:Type="String">Total Transactions: ${history.length}</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="Header"><Data ss:Type="String">TXN ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Counterparty</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Amount</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Date &amp; Time</Data></Cell>
   </Row>
`;

    let rows = "";
    history.forEach((t, index) => {
      const isAlt = index % 2 !== 0;
      const cellStyle = isAlt ? "CellAlternate" : "CellNormal";
      const amtStyle = isAlt ? "AmountStyleAlt" : "AmountStyle";
      
      const statusStyle = "StatusCompleted";
      const statusText = t.status.toUpperCase();
      const typeText = t.type.replace(/_/g, ' ').toUpperCase();
      
      // Amount is formatted like "-500.00 EGP" or "+100.00 EGP" in the UI, we export the same formatted string.
      const amtVal = t.amount;

      // Ensure proper formatting for Date output
      let formattedDate = `${t.date} ${t.time}`;

      rows += `   <Row ss:Height="20">
    <Cell ss:StyleID="${cellStyle}"><Data ss:Type="String">TXN-${t.id}</Data></Cell>
    <Cell ss:StyleID="${cellStyle}"><Data ss:Type="String">${escapeXml(t.name)}</Data></Cell>
    <Cell ss:StyleID="${amtStyle}"><Data ss:Type="String">${escapeXml(amtVal)}</Data></Cell>
    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(statusText)}</Data></Cell>
    <Cell ss:StyleID="${cellStyle}"><Data ss:Type="String">${escapeXml(typeText)}</Data></Cell>
    <Cell ss:StyleID="${cellStyle}"><Data ss:Type="String">${escapeXml(formattedDate)}</Data></Cell>
   </Row>\n`;
    });

    const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

    try {
      const blob = new Blob([xmlHeader + rows + xmlFooter], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transaction_history_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Transactions exported successfully");
    } catch (err: any) {
      toast.error("Failed to export transactions");
    }
  };

  // Group transactions by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, Payment[]> = {};
    history.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [history]);

  // Determine date labels (Today, Yesterday, or the actual date)
  const getDateLabel = (dateStr: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const yesterdayStr = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return dateStr;
  };

  return (
    <section id="transactions" className="page active">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="section-title text-[var(--text-primary)]">Transaction History</div>
          <button 
            onClick={handleExport} 
            className="btn btn-ghost"
            style={{ 
              padding: '6px 12px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            Export ↗
          </button>
        </div>
      </div>
      
      <div className="search-wrapper" style={{ marginBottom: '24px' }}>
        <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="search-input text-[var(--text-primary)]"
          placeholder="Search transactions..."
          id="txSearch"
          value={txSearchQuery}
          onChange={handleSearch}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className={`filter-tab ${txFilter === 'all' ? 'active' : ''}`} onClick={() => setTxFilter('all')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            All Status
          </div>
          <div className={`filter-tab ${txFilter === 'sent' ? 'active' : ''}`} onClick={() => setTxFilter('sent')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
            Sent
          </div>
          <div className={`filter-tab ${txFilter === 'received' ? 'active' : ''}`} onClick={() => setTxFilter('received')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7" /></svg>
            Received
          </div>
        </div>

        <div>
          <FloatingSelect
            value={txCategory}
            onChange={(v) => setTxCategory(v as any)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'transfers', label: 'Transfers' },
              { value: 'bills', label: 'Bills' },
              { value: 'donations', label: 'Donations' }
            ]}
          />
        </div>
      </div>

      <div id="tx-list">
        {isLoadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={28} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif', fontSize: '14px' }}>Loading transactions...</span>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif', fontSize: '15px' }}>
            No transactions found
          </div>
        ) : (
          <div className="tx-container">
            {Object.entries(groupedHistory).map(([date, txs], groupIndex) => {
              const label = getDateLabel(date);
              return (
                <React.Fragment key={date}>
                  <div className="tx-date-group-header">
                    <span className="tx-date-label">{label}</span>
                    <div className="tx-date-line"></div>
                    <span className="tx-date-count">{txs.length} txn{txs.length > 1 ? 's' : ''}</span>
                  </div>
                  {txs.map((tx, txIndex) => {
                    const amtClass = tx.status === 'received' ? 'positive' : 'negative';
                    const badgeClass = tx.status === 'received' ? 'badge-success' : 'badge-danger';
                    const delay = Math.min((groupIndex * txs.length + txIndex) * 12, 180);
                    return (
                      <div className="tx-card" style={{ animationDelay: `${delay}ms` }} key={tx.id}>
                        <div
                          className="tx-avatar"
                          style={{
                            background: tx.status === 'received'
                              ? 'linear-gradient(135deg, rgba(0,232,143,0.8), rgba(14,203,203,0.8))'
                              : 'linear-gradient(135deg, rgba(255,77,106,0.8), rgba(255,140,0,0.8))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {tx.status === 'received'
                            ? <ArrowDownLeft size={16} style={{ color: '#fff' }} />
                            : <ArrowUpRight size={16} style={{ color: '#fff' }} />
                          }
                        </div>
                        <div className="tx-info">
                          <div className="tx-name text-[var(--text-primary)]">{tx.name}</div>
                          <div className="tx-meta">
                            <span>{tx.time}</span>
                            <span className="tx-meta-dot"></span>
                            <span>{tx.desc}</span>
                          </div>
                        </div>
                        <div className="tx-right">
                          <div className={`tx-amount ${amtClass}`}>{tx.amount}</div>
                          <span className={`badge ${badgeClass}`}>● {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) {
          #transactions.page {
            padding: 16px !important;
          }
          .section-header {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }
          .section-title {
            font-size: 14px !important;
            font-weight: 800 !important;
            white-space: nowrap !important;
            letter-spacing: -0.3px !important;
          }
          .search-input {
            width: 140px !important;
            padding: 8px 12px 8px 32px !important;
            font-size: 12px !important;
            border-radius: 10px !important;
          }
          .search-icon {
            left: 10px !important;
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Transactions;
