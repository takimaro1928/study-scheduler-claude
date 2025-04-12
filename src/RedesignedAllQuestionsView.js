// src/RedesignedAllQuestionsView.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info, ChevronRight, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar';
// CSSモジュールをインポート
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css'; // ★追加

// ヘルパー関数や科目色定義 (変更なし)
const subjectColorMap = { /* ... */ };
const getSubjectColorClass = (subjectName) => { /* ... */ };
const getUnderstandingStyle = (understanding) => { /* ... */ };
const getCorrectRateColor = (rate) => { /* ... */ };

const RedesignedAllQuestionsView = ({ /* ... props ... */ }) => {
    // state定義 (変更なし)
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    // ... (他の state: expandedSubjects, expandedChapters などは App.js から props で受け取る)

    // filteredSubjects (useMemo) (変更なし)
    const filteredSubjects = useMemo(() => { /* ... */ }, [subjects, searchTerm, filters]);

    // toggleSelectAllForSubject (変更なし)
    const toggleSelectAllForSubject = (subject) => { /* ... */ };

    // executeBulkEdit (変更なし)
    const executeBulkEdit = () => { /* ... */ };


    // --- レンダリング ---
    return (
        <div className={styles.container}> {/* CSS Module適用 */}
            {/* 上部コントロール (className を styles.* に変更) */}
            <div className={styles.controlsContainer}>
                <div className={styles.searchBox}>
                    <input type="text" placeholder="問題IDで検索..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className={styles.searchIcon}><Search size={18}/></div>
                    {searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}> <XIcon size={18} /> </button> )}
                </div>
                <div className={styles.controlButtons}>
                    <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}> <Filter size={16} /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />} </button>
                    <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton} ${ bulkEditMode ? styles.bulkEditButtonActive : styles.bulkEditButtonInactive }`}> {bulkEditMode ? '選択終了' : '一括編集'} </button>
                </div>
            </div>

            {/* 詳細フィルターパネル (className を styles.* に変更) */}
            {showFilters && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterGrid}>
                        <div> <label className={styles.filterLabel}>理解度</label> <select className={styles.filterSelect} value={filters.understanding} onChange={(e) => setFilters({...filters, understanding: e.target.value})}> {/* options */} </select> </div>
                        <div> <label className={styles.filterLabel}>正解率</label> <select className={styles.filterSelect} value={filters.correctRate} onChange={(e) => setFilters({...filters, correctRate: e.target.value})}> {/* options */} </select> </div>
                        <div> <label className={styles.filterLabel}>復習間隔</label> <select className={styles.filterSelect} value={filters.interval} onChange={(e) => setFilters({...filters, interval: e.target.value})}> {/* options */} </select> </div>
                    </div>
                    <div className={styles.filterActions}> <button onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })} className={styles.filterResetButton}> リセット </button> </div>
                </div>
            )}

            {/* 一括編集時の操作パネル (className を styles.* に変更) */}
            {bulkEditMode && (
                <div className={styles.bulkEditPanel}>
                    <p className={styles.bulkEditText}> {selectedQuestions.length > 0 ? `${selectedQuestions.length} 件の問題を選択中` : "問題を選択してください"} </p>
                    <button onClick={() => setShowCalendarModal(true)} disabled={selectedQuestions.length === 0} className={styles.bulkEditButton}> <CalendarIcon size={16} /> 日付を一括設定 </button>
                </div>
            )}

            {/* 問題リスト (アコーディオン + カード) (className を styles.* に変更) */}
            {filteredSubjects.length === 0 ? ( /* ... */ ) : (
                <div className={styles.listContainer}>
                {filteredSubjects.map(subject => {
                    const subjectColorClass = getSubjectColorClass(subject.name); // これはTailwindクラスなので、CSS Moduleで別途定義するか、インラインスタイルにする
                    const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
                    const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
                    const subjectBorderColorStyle = { borderLeftColor: subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"] }; // インラインスタイルで色指定

                    return (
                    <div key={subject.id} className={styles.subjectAccordion}>
                        {/* 科目ヘッダー (インラインスタイルで左ボーダー色を指定) */}
                        <div className={styles.subjectHeader} style={subjectBorderColorStyle} onClick={() => toggleSubject(subject.id)}>
                            {bulkEditMode && ( <input type="checkbox" className={styles.subjectCheckbox} checked={isAllSelectedInSubject} onChange={() => toggleSelectAllForSubject(subject)} onClick={(e) => e.stopPropagation()} /> )}
                            <div className={`${styles.subjectChevron} ${expandedSubjects[subject.id] ? styles.subjectChevronOpen : ''}`}> <ChevronRight size={18} /> </div>
                            <h3 className={styles.subjectTitle}>{subject.name}</h3>
                            <div className={styles.subjectCountBadge}> {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問 </div>
                        </div>
                        {/* 科目の中身 */}
                        {expandedSubjects[subject.id] && (
                        <div className={styles.subjectContent}>
                            {subject.chapters.map(chapter => (
                            <div key={chapter.id} className={styles.chapterAccordion}>
                                {/* 章ヘッダー */}
                                <div className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}>
                                     <div className={`${styles.chapterChevron} ${expandedChapters[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div>
                                     <h4 className={styles.chapterTitle}>{chapter.name}</h4>
                                     <div className={styles.chapterCountBadge}> {chapter.questions.length}問 </div>
                                </div>
                                {/* 章の中の問題カードリスト */}
                                {expandedChapters[chapter.id] && (
                                <div className={styles.questionCardList}>
                                    {chapter.questions.map(question => {
                                    const understandingStyle = getUnderstandingStyle(question.understanding);
                                    const cardBorderColorStyle = { borderLeftColor: subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"] }; // インラインスタイルで色指定

                                    return (
                                        // 問題カード (インラインスタイルで左ボーダー色指定)
                                        <div key={question.id} className={styles.questionCard} style={cardBorderColorStyle}>
                                            {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )}
                                            <div className={styles.questionId} title={question.id}> {question.id} </div>
                                            {/* ステータス情報 */}
                                            <div className={styles.statusGrid}>
                                                <div className={styles.statusItem} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div>
                                                <div className={styles.statusItem} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div>
                                                <div className={`${styles.statusItem} ${styles.understandingBadge} ${styles[understandingStyle.bgClass.replace('bg-','understandingBadge')]}`} title={`理解度: ${question.understanding}`}> {React.cloneElement(understandingStyle.icon, { size: 14})} <span className={styles[understandingStyle.textClass.replace('text-','understandingText')]}> {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span> </div>
                                                <div className={styles.statusItem} title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}> <div className={styles.rateBarContainer}><div className={styles.rateBar}><div className={`${styles.rateBarInner} ${getCorrectRateColor(question.correctRate).replace('bg-','rateBarColor')}`} style={{ width: `${question.correctRate}%` }}></div></div></div> <span className={styles.rateText}>{question.correctRate}%</span> </div>
                                            </div>
                                            <button onClick={() => setEditingQuestion(question)} className={styles.editButton} title="編集"> <Edit size={16}/> </button>
                                        </div> // 問題カード end
                                    );
                                    })}
                                </div> // 問題カードリスト end
                                )}
                            </div> // 章 end
                            ))}
                        </div> // 科目の中身 end
                        )}
                    </div> // 科目アコーディオン end
                    );
                })}
                </div> // 問題リスト全体 end
            )}

            {/* 一括編集用カレンダーモーダル (枠組みにCSS Modules適用) */}
            {bulkEditMode && showCalendarModal && (
                <>
                    <div className={datePickerStyles.overlay} onClick={() => setShowCalendarModal(false)} />
                    <div className={datePickerStyles.modal}>
                        <button onClick={() => setShowCalendarModal(false)} className={datePickerStyles.closeButton}> <XIcon size={18} /> </button>
                        <div className={datePickerStyles.calendarContainer}>
                            <DatePickerCalendar selectedDate={selectedDate} onChange={setSelectedDate} />
                        </div>
                        <div className={datePickerStyles.footer}>
                            <span>{selectedQuestions.length}件選択中</span>
                            <button onClick={executeBulkEdit} disabled={!selectedDate || selectedQuestions.length === 0} className={datePickerStyles.confirmButton}>
                                選択した問題をこの日に設定
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 通知は App.js で管理 */}
        </div> // 全体コンテナ end
    );
};

export default RedesignedAllQuestionsView;
