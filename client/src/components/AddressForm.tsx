import { useState } from 'react'
import { XIcon, Navigation, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AddressForm = ({resetForm,handleSubmit,form,setForm,editingId}:any) => {
  const [detecting, setDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev: any) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: prev.address || `GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        }));
        toast.success('Location detected successfully!');
        setDetecting(false);
      },
      (err) => {
        toast.error('Unable to retrieve location. Please enter manually.');
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      {/* overlay */}
      <div 
      className='fixed inset-0 bg-black/40 z-50'>

    {/* form container */}
    <div onClick={resetForm}
    className="fixed inset-0 z-50 flex-center p-4">
      
      <form onClick={(e)=>e.stopPropagation()}
      onSubmit={handleSubmit} className="bg-white rounded-2xl 
      p-6 w-full max-w-lg animate-fade-in space-y-4">
              
              {/* form header */}
              <div className="flex items-center justify-between border-b border-app-border pb-3">
                <h2 className='text-lg font-semibold text-app-green'>
                  {editingId?"Edit Address":"Add new Address"}</h2>
                <button type="button" 
                onClick={resetForm} className='p-2 hover:bg-app-cream rounded-lg'>
                    <XIcon className='size-5'/>
                </button>
              </div>

              {/* GPS Auto-detect button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-app-orange-dark rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {detecting ? <Loader2 className="size-3.5 animate-spin" /> : <Navigation className="size-3.5" />}
                <span>Auto-Detect Current GPS Location</span>
              </button>

            {/* form- input fields */}
        <div className='space-y-4'>
                <div>
               <label className='block text-sm font-medium
               text-app-green mb-1.5'>
                Label</label>
                <input type="text" placeholder='Home,Work,etc.' required
                className='w-full px-4 py-2.5 text-sm
                 rounded-xl border border-app-border 
                 focus:border-app-green outline-none'
                 value={form.label}
                 onChange={(e)=>setForm({...form,label:e.target.value})}
                />
                </div>


                  <div>
               <label className='block text-sm font-medium
               text-app-green mb-1.5'>
                Street Address</label>
                <input type="text"  required
                className='w-full px-4 py-2.5 text-sm
                 rounded-xl border border-app-border 
                 focus:border-app-green outline-none'
                 value={form.address}
                 onChange={(e)=>setForm({...form,address:e.target.value})}
                />
                </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
               <label className='block text-sm font-medium
               text-app-green mb-1.5'>
                City</label>
                <input type="text" required
                className='w-full px-4 py-2.5 text-sm
                 rounded-xl border border-app-border 
                 focus:border-app-green outline-none'
                 value={form.city}
                 onChange={(e)=>setForm({...form,city:e.target.value})}
                />
                </div>

                <div>
               <label className='block text-sm font-medium
               text-app-green mb-1.5'>
                State</label>
                <input type="text" required
                className='w-full px-4 py-2.5 text-sm
                 rounded-xl border border-app-border 
                 focus:border-app-green outline-none'
                 value={form.state}
                 onChange={(e)=>setForm({...form,state:e.target.value})}
                />
                </div>
                </div>


                <div className='grid grid-cols-2 gap-3'>
                  <div>
             <label className='block text-sm font-medium
               text-app-green mb-1.5'>
                Zip Code</label>
                <input type="text" required
     className='w-full px-4 py-2.5 text-sm                 rounded-xl border border-app-border 
                 focus:border-app-green outline-none'
                 value={form.zip}
                 onChange={(e)=>setForm({...form,zip:e.target.value})}
                />
 
                  </div>
                  <div className='flex items-end pb-1'>
             <label className='flex items-center gap-2 cursor-pointer'>
                <input type="checkbox" checked={form.isDefault}
                onChange={(e)=>setForm({...form,isDefault:e.target.checked})}
                />
                <span className='text-sm text-app-text'>
                  Set as default</span>
              </label>
           </div>
            
                </div>
        </div>

        {/* submit button/ */}
        <button type="submit" className='mt-6 w-full py-3 bg-app-green 
        text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors'>
{editingId? "Update Address" :"Save Address"}
        </button>
      </form>
    </div>
      </div>
    </>
  )
}

export default AddressForm
