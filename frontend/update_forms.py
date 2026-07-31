import re

file_path = '/Users/rahulmahaseth/Desktop/rahul/Rahul-Portfolio/frontend/src/components/Admin.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 7. Render Forms
forms_ui = '''                  {activeSection === 'experience' && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white">Experience Management</h2>
                          <p className="text-gray-400">Add or edit your work experience.</p>
                        </div>
                      </div>
                      
                      <section className="rounded-2xl border border-gray-800 bg-black/50 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Experience</h3>
                        <div className="grid gap-4">
                          {experienceItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between rounded-xl bg-gray-900/50 p-4 border border-gray-800">
                              <div>
                                <h4 className="font-semibold text-white">{item.role} @ {item.organization}</h4>
                                <p className="text-sm text-gray-400">{item.projectName} | {item.startDate} - {item.endDate}</p>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => editExperience(item)} className="text-gray-400 hover:text-white"><Edit3 className="w-4 h-4"/></button>
                                <button type="button" onClick={() => deleteExperience(item._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-gray-800 bg-black/50 p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">{experienceEditId ? 'Update Experience' : 'Add Experience'}</h4>
                        <form onSubmit={submitExperience} className="space-y-4">
                          <input type="text" value={experienceForm.projectName} onChange={(e) => setExperienceForm(s => ({...s, projectName: e.target.value}))} placeholder="Project/Company Name" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={experienceForm.role} onChange={(e) => setExperienceForm(s => ({...s, role: e.target.value}))} placeholder="Role" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={experienceForm.organization} onChange={(e) => setExperienceForm(s => ({...s, organization: e.target.value}))} placeholder="Organization/Company" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <textarea value={experienceForm.description} onChange={(e) => setExperienceForm(s => ({...s, description: e.target.value}))} placeholder="Description" rows={3} className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={experienceForm.startDate} onChange={(e) => setExperienceForm(s => ({...s, startDate: e.target.value}))} placeholder="Start Date" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                            <input type="text" value={experienceForm.endDate} onChange={(e) => setExperienceForm(s => ({...s, endDate: e.target.value}))} placeholder="End Date / Present" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          </div>
                          <div className="flex gap-4 pt-2">
                            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">{experienceEditId ? 'Update' : 'Create'}</button>
                            <button type="button" onClick={resetExperienceForm} className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary">Reset</button>
                          </div>
                        </form>
                      </section>
                    </div>
                  )}

                  {activeSection === 'education' && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white">Education Management</h2>
                          <p className="text-gray-400">Add or edit your education background.</p>
                        </div>
                      </div>
                      
                      <section className="rounded-2xl border border-gray-800 bg-black/50 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Current Education</h3>
                        <div className="grid gap-4">
                          {educationItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between rounded-xl bg-gray-900/50 p-4 border border-gray-800">
                              <div>
                                <h4 className="font-semibold text-white">{item.degreeName} @ {item.collegeName}</h4>
                                <p className="text-sm text-gray-400">{item.location} | {item.startYear} - {item.passingOutYear}</p>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => editEducation(item)} className="text-gray-400 hover:text-white"><Edit3 className="w-4 h-4"/></button>
                                <button type="button" onClick={() => deleteEducation(item._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-2xl border border-gray-800 bg-black/50 p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">{educationEditId ? 'Update Education' : 'Add Education'}</h4>
                        <form onSubmit={submitEducation} className="space-y-4">
                          <input type="text" value={educationForm.collegeName} onChange={(e) => setEducationForm(s => ({...s, collegeName: e.target.value}))} placeholder="College Name" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={educationForm.degreeName} onChange={(e) => setEducationForm(s => ({...s, degreeName: e.target.value}))} placeholder="Degree Name" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <input type="text" value={educationForm.location} onChange={(e) => setEducationForm(s => ({...s, location: e.target.value}))} placeholder="Location" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={educationForm.startYear} onChange={(e) => setEducationForm(s => ({...s, startYear: e.target.value}))} placeholder="Start Year" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                            <input type="text" value={educationForm.passingOutYear} onChange={(e) => setEducationForm(s => ({...s, passingOutYear: e.target.value}))} placeholder="Passing Out Year" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          </div>
                          <input type="text" value={educationForm.percentage} onChange={(e) => setEducationForm(s => ({...s, percentage: e.target.value}))} placeholder="Percentage/CGPA" required className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:outline-none focus:border-primary transition-all" />
                          <div className="flex gap-4 pt-2">
                            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed">{educationEditId ? 'Update' : 'Create'}</button>
                            <button type="button" onClick={resetEducationForm} className="w-full rounded-2xl border border-gray-700 bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-primary">Reset</button>
                          </div>
                        </form>
                      </section>
                    </div>
                  )}'''

content = re.sub(
    r'                  \{activeSection === \'timeline\' && \((.*?)\n                  \)\}',
    forms_ui,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w') as f:
    f.write(content)

print('Updated Forms')
