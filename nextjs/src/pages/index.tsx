import Head from 'next/head';
import { useState, useEffect } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default function Home() {
  const [section, setSection] = useState<'write' | 'read'>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Supabase 클라이언트
  const [supabase, setSupabase] = useState<any>(null);
  useEffect(() => {
    import('@supabase/supabase-js').then(({ createClient }) => {
      setSupabase(createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
    });
  }, []);

  useEffect(() => {
    if (section === 'read' && supabase) {
      loadPosts();
    }
    // eslint-disable-next-line
  }, [section, supabase]);

  const loadPosts = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data);
    } catch (e) {
      setMessage({ type: 'error', text: '글을 불러오는 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: '제목과 내용을 모두 입력해주세요.' });
      return;
    }
    if (title.length > 100) {
      setMessage({ type: 'error', text: '제목은 100자 이내로 작성해주세요.' });
      return;
    }
    if (content.length > 5000) {
      setMessage({ type: 'error', text: '내용은 5000자 이내로 작성해주세요.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.from('posts').insert([{ title, content }]);
      if (error) throw error;
      setTitle('');
      setContent('');
      setMessage({ type: 'success', text: '글이 성공적으로 등록되었습니다!' });
      setTimeout(() => setSection('read'), 1000);
    } catch (e) {
      setMessage({ type: 'error', text: '글 작성 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>글</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GowunBatang-Regular.woff" />
        <style>{`
          body { font-family: 'GounBatang', serif; background: #fefefe; color: #222; line-height: 1.8; font-size: 18px; }
          .container { max-width: 700px; margin: 0 auto; padding: 60px 40px; min-height: 100vh; }
          header { margin-bottom: 80px; text-align: center; }
          h1 { font-size: 28px; font-weight: normal; letter-spacing: 2px; margin-bottom: 20px; }
          .subtitle { font-size: 14px; color: #666; letter-spacing: 1px; }
          .nav { display: flex; justify-content: center; gap: 40px; margin-bottom: 60px; }
          .nav button { background: none; border: none; font-family: 'GounBatang', serif; font-size: 16px; color: #999; cursor: pointer; padding: 10px 0; border-bottom: 2px solid transparent; transition: all 0.3s; }
          .nav button.active { color: #222; border-bottom-color: #222; }
          .nav button:hover { color: #222; }
          .section { display: none; }
          .section.active { display: block; }
          .writing-area { margin-bottom: 40px; }
          .title-input, textarea { width: 100%; border: none; outline: none; background: transparent; font-family: 'GounBatang', serif; }
          .title-input { font-size: 22px; font-weight: 700; color: #222; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          textarea { min-height: 300px; font-size: 18px; line-height: 1.8; color: #222; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; resize: none; }
          .write-actions { display: flex; justify-content: center; gap: 20px; margin-bottom: 40px; }
          .write-actions button { background: none; border: 1px solid #ddd; padding: 10px 20px; font-family: 'GounBatang', serif; font-size: 14px; color: #666; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
          .write-actions button:hover { background: #222; color: #fff; border-color: #222; }
          .write-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
          .posts-container { min-height: 400px; }
          .post { margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #f0f0f0; }
          .post-title { font-size: 22px; font-weight: 700; color: #222; margin-bottom: 15px; line-height: 1.4; }
          .post-meta { font-size: 12px; color: #999; margin-bottom: 25px; letter-spacing: 0.5px; }
          .post-content { font-size: 18px; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
          .empty-message { text-align: center; color: #999; font-style: italic; padding: 80px 0; }
        `}</style>
      </Head>
      <div className="container">
        <header>
          <h1>글</h1>
          <p className="subtitle">생각을 나누는 공간</p>
        </header>
        <nav className="nav">
          <button className={section === 'write' ? 'nav-btn active' : 'nav-btn'} onClick={() => setSection('write')}>쓰기</button>
          <button className={section === 'read' ? 'nav-btn active' : 'nav-btn'} onClick={() => setSection('read')}>읽기</button>
        </nav>
        <section className={section === 'write' ? 'section active' : 'section'}>
          {message && message.type === 'error' && <div className="error-message">{message.text}</div>}
          {message && message.type === 'success' && <div className="success-message">{message.text}</div>}
          <div className="writing-area">
            <input type="text" className="title-input" placeholder="제목을 입력하세요" maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="당신의 생각을 적어보세요..." value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="write-actions">
            <button onClick={() => { setTitle(''); setContent(''); setMessage(null); }}>지우기</button>
            <button onClick={submitPost} disabled={loading}>올리기</button>
          </div>
        </section>
        <section className={section === 'read' ? 'section active' : 'section'}>
          {message && section === 'read' && message.type === 'error' && <div className="error-message">{message.text}</div>}
          <div className="posts-container">
            {loading ? <div className="empty-message">글을 불러오는 중...</div> :
              posts.length === 0 ? <div className="empty-message">아직 글이 없습니다. 첫 번째 글을 써보세요.</div> :
                posts.map(post => (
                  <div className="post" key={post.id}>
                    <h2 className="post-title">{post.title}</h2>
                    <div className="post-meta">{new Date(post.created_at).toLocaleString('ko-KR')}</div>
                    <div className="post-content">{post.content}</div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </>
  );
}
