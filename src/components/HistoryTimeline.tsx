import React from 'react';
import { Clock, MessageSquare, History } from 'lucide-react';
import { useHistory, HistoryItem, Comment, HistoryItemType } from '../contexts/HistoryContext';

interface HistoryTimelineProps {
  itemId: string;
  itemType: HistoryItemType;
}

export default function HistoryTimeline({ itemId, itemType }: HistoryTimelineProps) {
  const { getHistory, getComments, addComment } = useHistory();
  const [newComment, setNewComment] = React.useState('');

  const history = getHistory(itemId, itemType);
  const comments = getComments(itemId, itemType);

  // Combine and sort history items and comments by timestamp
  const timeline = [...history, ...comments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(itemId, itemType, newComment.trim());
      setNewComment('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getChangeDescription = (change: HistoryItem['changes'][0]) => {
    if (!change.oldValue) {
      return `Definido ${change.field} como "${change.newValue}"`;
    }
    return `Alterado ${change.field} de "${change.oldValue}" para "${change.newValue}"`;
  };

  const getActionColor = (item: HistoryItem | Comment) => {
    if ('action' in item) {
      switch (item.action) {
        case 'create':
          return 'bg-green-100 text-green-800';
        case 'update':
          return 'bg-blue-100 text-blue-800';
        case 'delete':
          return 'bg-red-100 text-red-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicionar comentário..."
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Adicionar Comentário
          </button>
        </div>
      </form>

      {/* Timeline */}
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {timeline.map((item, itemIdx) => (
            <li key={item.id}>
              <div className="relative pb-8">
                {itemIdx !== timeline.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      'content' in item ? 'bg-gray-100' : getActionColor(item)
                    }`}>
                      {'content' in item ? (
                        <MessageSquare className="h-5 w-5 text-gray-500" />
                      ) : (
                        <History className="h-5 w-5" />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {item.userName}
                        </span>
                        {' content' in item ? (
                          <span> comentou</span>
                        ) : (
                          <span>
                            {item.action === 'create' && ' criou o registro'}
                            {item.action === 'update' && ' atualizou o registro'}
                            {item.action === 'delete' && ' removeu o registro'}
                          </span>
                        )}
                      </p>
                      {'content' in item ? (
                        <p className="mt-1 text-sm text-gray-700">{item.content}</p>
                      ) : (
                        <div className="mt-1">
                          {item.changes.map((change, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {getChangeDescription(change)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={item.timestamp}>
                        {formatTimestamp(item.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}