'use client';

import React, { useState, useEffect } from 'react';
import { CoachingItem, getCoachingItems, addCoachingItem, User, getUsers } from '@/lib/db';
import styles from './CoachingList.module.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useModalHistory } from '@/hooks/useModalHistory';

interface Props {
  onClose: () => void;
  onSelectItem: (item: CoachingItem) => void;
  isAdmin?: boolean;
}

export default function CoachingList({ onClose, onSelectItem, isAdmin }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<CoachingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const canAdd = isInstructor || isAdmin;
  
  // Modal for new coaching
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useModalHistory(showNewModal, () => setShowNewModal(false), 'newCoaching');

  useEffect(() => {
    const savedUser = localStorage.getItem('ft_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsInstructor(!!user.isInstructor);
      loadItems(user);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadItems = async (user: any) => {
    setIsLoading(true);
    try {
      const userPhone = user.phone.replace(/[^0-9]/g, '');
      let data: CoachingItem[] = [];
      
      if (isAdmin) {
        data = await getCoachingItems({ isAdmin: true });
      } else {
        // Show both student and instructor records related to me
        data = await getCoachingItems({ relatedPhone: userPhone });
      }

      // Fill in missing photoURLs for older items
      const allUsers = await getUsers();
      const userMap = new Map(allUsers.map(u => [u.phone.replace(/[^0-9]/g, ''), u.photoURL]));
      
      const enrichedData = data.map(item => ({
        ...item,
        studentPhotoURL: item.studentPhotoURL || userMap.get(item.studentPhone.replace(/[^0-9]/g, '')),
        instructorPhotoURL: item.instructorPhotoURL || userMap.get(item.instructorPhone.replace(/[^0-9]/g, ''))
      }));
      
      setItems(enrichedData.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } catch (error) {
      console.error("Error loading coaching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showNewModal) {
      handleSearch(searchTerm);
    }
  }, [searchTerm, showNewModal]);

  const handleSearch = async (term: string) => {
    setIsSearching(true);
    try {
      const allUsers = await getUsers();
      const filtered = allUsers.filter(u => 
        u.phone !== currentUser?.phone && 
        (u.nickname?.toLowerCase().includes(term.toLowerCase()) || 
         u.phone.includes(term))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenNewModal = () => {
    setSearchTerm('');
    setSelectedStudent(null);
    setShowNewModal(true);
  };

  const handleCreateCoaching = async () => {
    if (!selectedStudent || !newTitle.trim()) {
      alert(t.coaching.selectStudent || '수강생과 제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const userPhone = currentUser.phone.replace(/[^0-9]/g, '');
      const studentPhone = selectedStudent.phone.replace(/[^0-9]/g, '');

      const newItem: Omit<CoachingItem, 'id'> = {
        title: newTitle,
        description: newDesc,
        progress: 0,
        status: 'ongoing',
        studentPhone: studentPhone,
        studentNickname: selectedStudent.nickname || 'Student',
        studentPhotoURL: selectedStudent.photoURL || '',
        instructorPhone: userPhone,
        instructorNickname: currentUser.nickname || 'Instructor',
        instructorPhotoURL: currentUser.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addCoachingItem(newItem);
      setShowNewModal(false);
      setNewTitle('');
      setNewDesc('');
      setSelectedStudent(null);
      loadItems(currentUser); // Refresh list
    } catch (error) {
      console.error("Error creating coaching item:", error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{t.coaching.title}</h3>
        {canAdd && (
          <button className={styles.addButton} onClick={handleOpenNewModal}>
            {t.coaching.newCoaching}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>{t.coaching.empty}</div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`${styles.item} ${item.status === 'solved' ? styles.solved : ''}`}
              onClick={() => onSelectItem(item)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.studentPhoto}>
                  {item.studentPhotoURL ? (
                    <img src={item.studentPhotoURL} alt="" />
                  ) : (
                    <span>{item.studentNickname[0]}</span>
                  )}
                </div>
                <div className={styles.itemMain}>
                  <div className={styles.itemTitle}>
                    {item.title}
                    {item.status === 'solved' && <span className={styles.solvedBadge}>{t.coaching.solvedBadge}</span>}
                  </div>
                  <div className={styles.itemMeta}>
                    {canAdd ? (
                      <span>{t.coaching.student}: {item.studentNickname}</span>
                    ) : (
                      <span>{t.coaching.instructor}: {item.instructorNickname}</span>
                    )}
                    <span className={styles.date}>{item.updatedAt.split('T')[0]}</span>
                  </div>
                </div>
              </div>
              <div className={styles.progressSection}>
                <div className={styles.progressBarContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${item.progress}%` }}
                    />
                    {/* Milestone Markers */}
                    {item.milestones?.map((m, idx) => (
                      <div 
                        key={idx}
                        className={styles.milestoneMarker}
                        style={{ left: `${m.progress}%` }}
                        title={`${m.progress}% (${m.date})`}
                      />
                    ))}
                  </div>
                  <span className={styles.progressText}>{item.progress}%</span>
                </div>
                
                {/* Milestone History Text */}
                {item.milestones && item.milestones.length > 0 && (
                  <div className={styles.milestonesHistory}>
                    {item.milestones.map((m, idx) => (
                      <span key={idx} className={styles.milestoneTag}>
                        {m.progress}% {m.date}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showNewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h4>{t.coaching.newCoaching}</h4>
            
            <div className={styles.field}>
              <label>{t.coaching.selectStudent}</label>
              {selectedStudent ? (
                <div className={styles.selectedStudentChip} onClick={() => setSelectedStudent(null)}>
                  <div className={styles.studentAvatar}>
                    {selectedStudent.photoURL ? (
                      <img src={selectedStudent.photoURL} alt="" />
                    ) : (
                      <span>{selectedStudent.nickname[0]}</span>
                    )}
                  </div>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentNickname}>{selectedStudent.nickname}</span>
                    <span className={styles.studentPhone}>{selectedStudent.phone.slice(-4)}</span>
                  </div>
                  <span className={styles.chipRemove}>✕</span>
                </div>
              ) : (
                <div className={styles.searchWrapper}>
                  <div className={styles.searchInputArea}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input 
                      type="text"
                      className={styles.searchInput}
                      placeholder={t.coaching.searchStudentPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className={styles.searchResults}>
                    {isSearching ? (
                      <div className={styles.searchStatus}>{t.coaching.searchSearching}</div>
                    ) : searchResults.length === 0 ? (
                      <div className={styles.searchStatus}>{t.coaching.searchNoResults}</div>
                    ) : (
                      searchResults.map(user => (
                        <div 
                          key={user.phone} 
                          className={styles.searchResultItem}
                          onClick={() => setSelectedStudent(user)}
                        >
                          <div className={styles.studentAvatarSmall}>
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" />
                            ) : (
                              <span>{user.nickname[0]}</span>
                            )}
                          </div>
                          <div className={styles.searchResultInfo}>
                            <span className={styles.searchNickname}>{user.nickname}</span>
                            <span className={styles.searchPhone}>{user.phone.slice(-4)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label>{t.coaching.itemTitle}</label>
              <input 
                type="text" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="예: 발 동작 교정"
              />
            </div>

            <div className={styles.field}>
              <label>{t.coaching.itemDesc}</label>
              <textarea 
                value={newDesc} 
                onChange={(e) => setNewDesc(e.target.value)} 
                placeholder="상세 내용을 입력하세요..."
              />
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowNewModal(false)}
              >
                {t.common?.cancel || '취소'}
              </button>
              <button 
                className={styles.confirmButton} 
                onClick={handleCreateCoaching}
                disabled={isSaving}
              >
                {isSaving ? t.coaching.creating : t.coaching.newCoaching}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
