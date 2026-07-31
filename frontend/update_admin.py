import re

file_path = '/Users/rahulmahaseth/Desktop/rahul/Rahul-Portfolio/frontend/src/components/Admin.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 5. CRUD functions
crud_funcs = '''  // --- Experience CRUD ---
  const submitExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = experienceEditId ? `http://localhost:5001/api/experience/${experienceEditId}` : 'http://localhost:5001/api/experience';
      const method = experienceEditId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(experienceForm) });
      if (res.ok) {
        setMessage({ type: 'success', text: experienceEditId ? 'Experience updated.' : 'Experience created.' });
        resetExperienceForm();
        fetchExperienceItems();
      } else throw new Error();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save experience.' });
    } finally { setLoading(false); }
  };

  const deleteExperience = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/experience/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Experience deleted.' });
        fetchExperienceItems();
      } else throw new Error();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete experience.' });
    }
  };

  const editExperience = (item: ExperienceRecord) => {
    setExperienceEditId(item._id);
    setExperienceForm({ 
      projectName: item.projectName, role: item.role, organization: item.organization, description: item.description, startDate: item.startDate, endDate: item.endDate
    });
    setActiveSection('experience');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetExperienceForm = () => {
    setExperienceForm({ projectName: '', role: '', organization: '', description: '', startDate: '', endDate: 'Present' });
    setExperienceEditId(null);
  };

  // --- Education CRUD ---
  const submitEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = educationEditId ? `http://localhost:5001/api/education/${educationEditId}` : 'http://localhost:5001/api/education';
      const method = educationEditId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(educationForm) });
      if (res.ok) {
        setMessage({ type: 'success', text: educationEditId ? 'Education updated.' : 'Education created.' });
        resetEducationForm();
        fetchEducationItems();
      } else throw new Error();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save education.' });
    } finally { setLoading(false); }
  };

  const deleteEducation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/education/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Education deleted.' });
        fetchEducationItems();
      } else throw new Error();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete education.' });
    }
  };

  const editEducation = (item: EducationRecord) => {
    setEducationEditId(item._id);
    setEducationForm({ 
      collegeName: item.collegeName, degreeName: item.degreeName, location: item.location, startYear: item.startYear, passingOutYear: item.passingOutYear, percentage: item.percentage
    });
    setActiveSection('education');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetEducationForm = () => {
    setEducationForm({ collegeName: '', degreeName: '', location: '', startYear: '', passingOutYear: '', percentage: '' });
    setEducationEditId(null);
  };'''

# Find the timeline CRUD functions and replace them
content = re.sub(
    r'  const submitTimeline = async.*?const resetTimelineForm = \(\) => \{.*?setTimelineEditId\(null\);\n  \};\n',
    crud_funcs + '\n',
    content,
    flags=re.DOTALL
)

# 6. Sidebar tabs
sidebar_tabs = r"{['certificates', 'skills', 'projects', 'achievements', 'about', 'resume', 'experience', 'education'].map((section) => ("
content = re.sub(
    r"\{\[\'certificates\', \'skills\', \'projects\', \'achievements\', \'about\', \'resume\', \'timeline\'\]\.map\(\(section\) => \(",
    sidebar_tabs,
    content
)

with open(file_path, 'w') as f:
    f.write(content)

print('Updated CRUD functions and sidebar tabs.')
