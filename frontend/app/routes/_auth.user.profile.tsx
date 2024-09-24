// routes/user/profile.tsx
import { ActionFunction, json } from '@remix-run/cloudflare';
import UserService from '../../api/services/userService';

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const preparedFormDataString = formData.get('preparedFormData') ;


    if (!preparedFormDataString || typeof preparedFormDataString !== 'string') {
      return json({ success: false, message: 'Invalid form data' }, { status: 400 });
    }

    const preparedFormData = JSON.parse(preparedFormDataString);

    console.log(preparedFormData);
    
    // Send the data to the user service
    // const response = await UserService.post('user/profile', preparedFormData);

    const response = "ok";
    if (!response) {
      return json(
        { success: false, message: 'An error occurred while submitting the profile.' },
        { status: 500 }
      );
    }

    // Return success response
    return json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return json({ success: false, message: 'An unexpected error occurred.' }, { status: 500 });
  }
};

// Since we're not rendering any UI for this route, we can export an empty component
export default function UserProfile() {
  return null;
}
