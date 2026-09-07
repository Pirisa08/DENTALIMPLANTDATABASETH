import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminSearchBar from '../components/AdminSearchBar.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { feedbackAPI } from '../../services/api.js';
import './ContactFeedback.css';

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="fbTitleIcon">
    <path d="M4.5 5.5h15v13h-15v-13Z" />
    <path d="m5 6 7 6.2L19 6" />
    <path d="M8.5 16h7" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="fbButtonIcon">
    <path d="M20 7.8v4.5h-4.5" />
    <path d="M19.2 12.3a7 7 0 1 1-2.1-5" />
  </svg>
);

const BannerIcon = ({ type }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="fbBannerIcon">
    {type === 'error' ? (
      <>
        <path d="M12 4.2 3.8 18.6h16.4L12 4.2Z" />
        <path d="M12 9v4.4" />
        <path d="M12 16.5h.1" />
      </>
    ) : (
      <path d="M20 6.5 9.4 17.1 4 11.7" />
    )}
  </svg>
);

const formatTimestamp = (value) => {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (err) {
    return new Date(value).toLocaleString();
  }
};

export default function ContactFeedback() {
  const [allFeedback, setAllFeedback] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [showResolved, setShowResolved] = useState(false);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const items = await feedbackAPI.list();
      setAllFeedback(items);
    } catch (err) {
      setError(err.message || 'Unable to load feedback right now.');
      setAllFeedback([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 3200);
    return () => clearTimeout(timer);
  }, [banner]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allFeedback
      .filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!term) return true;
        const blobs = [item.name, item.email, item.subject, item.message]
          .map((val) => (val || '').toString().toLowerCase());
        return blobs.some((chunk) => chunk.includes(term));
      });
  }, [allFeedback, search, statusFilter]);

  const openItems = useMemo(() => filtered.filter((item) => item.status !== 'resolved'), [filtered]);
  const resolvedItems = useMemo(() => filtered.filter((item) => item.status === 'resolved'), [filtered]);

  const statusCounts = useMemo(() => {
    return allFeedback.reduce(
      (acc, item) => {
        const key = item.status && STATUS_LABELS[item.status] ? item.status : 'new';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { new: 0, in_progress: 0, resolved: 0 }
    );
  }, [allFeedback]);

  const handleStatusChange = async (id, nextStatus) => {
    const current = allFeedback.find((item) => item.id === id);
    if (!current || current.status === nextStatus) return;

    setUpdatingId(id);
    try {
      const updated = await feedbackAPI.updateStatus(id, nextStatus);
      setAllFeedback((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setBanner({ type: 'success', message: 'Status updated successfully.' });
    } catch (err) {
      setBanner({ type: 'error', message: err.message || 'Unable to update status.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const refresh = async () => {
    await loadFeedback();
    setBanner({ type: 'success', message: 'Feedback refreshed.' });
  };

  const toggleReply = (id) => {
    setOpenReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReplyDraft = (id, value) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleReply = async (id) => {
    const message = (replyDrafts[id] ?? '').trim();
    if (!message) {
      setBanner({ type: 'error', message: 'Reply message cannot be empty.' });
      return;
    }

    setReplyingId(id);
    try {
      const updated = await feedbackAPI.reply(id, { adminReply: message });
      setAllFeedback((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setReplyDrafts((prev) => ({ ...prev, [id]: '' }));
      setOpenReplies((prev) => ({ ...prev, [id]: false }));
      setBanner({ type: 'success', message: 'Reply saved and marked as resolved.' });
    } catch (err) {
      setBanner({ type: 'error', message: err.message || 'Unable to send reply.' });
    } finally {
      setReplyingId(null);
    }
  };

  const activeBanner = error ? { type: 'error', message: error } : banner;

  return (
    <div className="fbWrap">
      <AdminSearchBar
        placeholder="Search feedback..."
        value={search}
        onChangeQ={setSearch}
        onSearch={setSearch}
      />

      <Breadcrumb
        items={[
          { label: 'Home', href: '/admin' },
          { label: 'Contact Feedback' },
        ]}
      />
      <h2 className="fbTitle">
        <InboxIcon />
        <span>Contact Feedback Inbox</span>
      </h2>

      <div className="fbSummary">
        <div className="fbSummaryCard">
          <div className="fbSummaryLabel">New</div>
          <div className="fbSummaryValue">{statusCounts.new || 0}</div>
          <div className="fbSummaryHint">Awaiting review</div>
        </div>
        <div className="fbSummaryCard">
          <div className="fbSummaryLabel">In Progress</div>
          <div className="fbSummaryValue">{statusCounts.in_progress || 0}</div>
          <div className="fbSummaryHint">Being handled</div>
        </div>
        <div className="fbSummaryCard">
          <div className="fbSummaryLabel">Resolved</div>
          <div className="fbSummaryValue">{statusCounts.resolved || 0}</div>
          <div className="fbSummaryHint">Closed requests</div>
        </div>
      </div>

      <div className="fbPanel">
        {activeBanner && (
          <div className={`fbBanner ${activeBanner.type === 'error' ? 'error' : 'success'}`}>
            <BannerIcon type={activeBanner.type} />
            <span>{activeBanner.message}</span>
          </div>
        )}

        <div className="fbToolbar">
          <div className="fbFilterGroup">
            <label htmlFor="statusFilter" className="fbFilterLabel">
              Status
            </label>
            <select
              id="statusFilter"
              className="fbStatusSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="fbRefreshBtn"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshIcon />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="fbEmpty">Loading feedback...</div>
        ) : filtered.length === 0 ? (
          <div className="fbEmpty">
            {statusFilter === 'all' && !search
              ? 'No feedback has been submitted yet.'
              : 'No feedback matches your filters.'}
          </div>
        ) : (
          <>
            {statusFilter !== 'resolved' && (
              <div className="fbList">
                {openItems.map((item) => (
                  <article className="fbItem" key={item.id}>
                    <header className="fbItemHeader">
                      <div>
                        <div className="fbItemSubject">{item.subject || 'No subject'}</div>
                        <div className="fbItemMeta">
                          <span>{item.name || 'Anonymous'}</span>
                          <span>•</span>
                          <a href={`mailto:${item.email}`} className="fbItemEmail">
                            {item.email}
                          </a>
                          <span>•</span>
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </div>
                        {item.isLocal && (
                          <div className="fbLocalNotice">Pending sync when connection restores.</div>
                        )}
                      </div>
                      <div className="fbItemControls">
                        <span className={`statusTag ${item.status}`}>
                          {STATUS_LABELS[item.status] || 'New'}
                        </span>
                        <select
                          className="fbStatusSelect compact"
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          disabled={updatingId === item.id}
                        >
                          {STATUS_OPTIONS.filter((opt) => opt.value !== 'all').map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </header>

                    <div className="fbItemMessage">
                      {item.message || 'No message provided.'}
                    </div>

                    {item.adminReply && (
                      <div className="fbAdminReply">
                        <div className="fbAdminReplyHead">
                          <span className="fbAdminReplyLabel">Your Response</span>
                          <span className="fbAdminReplyMeta">
                            {(item.responder || 'Admin') + ' • ' + formatTimestamp(item.respondedAt)}
                          </span>
                        </div>
                        <p>{item.adminReply}</p>
                      </div>
                    )}

                    {!item.isLocal && (
                      <div className="fbReplyActions">
                        <button
                          type="button"
                          className="fbReplyToggle"
                          onClick={() => toggleReply(item.id)}
                        >
                          {openReplies[item.id] ? 'Cancel reply' : item.adminReply ? 'Update reply' : 'Reply & resolve'}
                        </button>
                        {openReplies[item.id] && (
                          <div className="fbReplyForm">
                            <textarea
                              rows="3"
                              placeholder="Write your reply..."
                              value={replyDrafts[item.id] ?? item.adminReply ?? ''}
                              onChange={(e) => handleReplyDraft(item.id, e.target.value)}
                            />
                            <div className="fbReplyFormActions">
                              <button
                                type="button"
                                className="fbReplySubmit"
                                onClick={() => handleReply(item.id)}
                                disabled={replyingId === item.id}
                              >
                                {replyingId === item.id ? 'Saving...' : 'Save reply & mark resolved'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
                {openItems.length === 0 && (
                  <div className="fbEmpty">All messages are resolved.</div>
                )}
              </div>
            )}

            {statusFilter === 'resolved' ? (
              <div className="fbList">
                {resolvedItems.map((item) => (
                  <article className="fbItem" key={item.id}>
                    <header className="fbItemHeader">
                      <div>
                        <div className="fbItemSubject">{item.subject || 'No subject'}</div>
                        <div className="fbItemMeta">
                          <span>{item.name || 'Anonymous'}</span>
                          <span>•</span>
                          <a href={`mailto:${item.email}`} className="fbItemEmail">
                            {item.email}
                          </a>
                          <span>•</span>
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="fbItemControls">
                        <span className={`statusTag ${item.status}`}>
                          {STATUS_LABELS[item.status] || 'Resolved'}
                        </span>
                      </div>
                    </header>
                    <div className="fbItemMessage">
                      {item.message || 'No message provided.'}
                    </div>
                    {item.adminReply && (
                      <div className="fbAdminReply">
                        <div className="fbAdminReplyHead">
                          <span className="fbAdminReplyLabel">Your Response</span>
                          <span className="fbAdminReplyMeta">
                            {(item.responder || 'Admin') + ' • ' + formatTimestamp(item.respondedAt)}
                          </span>
                        </div>
                        <p>{item.adminReply}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : resolvedItems.length > 0 && (
              <div className="fbFinished">
                <button
                  type="button"
                  className="fbFinishedToggle"
                  onClick={() => setShowResolved((prev) => !prev)}
                >
                  {showResolved ? 'Hide finished responses' : `Show finished responses (${resolvedItems.length})`}
                </button>
                {showResolved && (
                  <div className="fbList finished">
                    {resolvedItems.map((item) => (
                      <article className="fbItem" key={item.id}>
                        <header className="fbItemHeader">
                          <div>
                            <div className="fbItemSubject">{item.subject || 'No subject'}</div>
                            <div className="fbItemMeta">
                              <span>{item.name || 'Anonymous'}</span>
                              <span>•</span>
                              <a href={`mailto:${item.email}`} className="fbItemEmail">
                                {item.email}
                              </a>
                              <span>•</span>
                              <span>{formatTimestamp(item.createdAt)}</span>
                            </div>
                          </div>
                          <div className="fbItemControls">
                            <span className={`statusTag ${item.status}`}>
                              {STATUS_LABELS[item.status] || 'Resolved'}
                            </span>
                          </div>
                        </header>
                        <div className="fbItemMessage">
                          {item.message || 'No message provided.'}
                        </div>
                        {item.adminReply && (
                          <div className="fbAdminReply">
                            <div className="fbAdminReplyHead">
                              <span className="fbAdminReplyLabel">Your Response</span>
                              <span className="fbAdminReplyMeta">
                                {(item.responder || 'Admin') + ' • ' + formatTimestamp(item.respondedAt)}
                              </span>
                            </div>
                            <p>{item.adminReply}</p>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
