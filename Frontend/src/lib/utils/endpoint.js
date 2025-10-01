const BASEURL = 'http://localhost'
const AUTHSERVICEURL = `${BASEURL}:3002/api/authService`
export const PROMPTSERVICEURL = `${BASEURL}:3003/api/promptService`
export const ANALYTICSSERVICEURL = `${BASEURL}:3004/api/analyticService`

export const LOGIN_ENDPOINT = `${AUTHSERVICEURL}/login`
export const SIGNUP_ENDPOINT = `${AUTHSERVICEURL}/register`

export const GET_PROMPT = `${PROMPTSERVICEURL}/getPrompts`;
export const ADD_PROMPT = `${PROMPTSERVICEURL}/addPrompt`;
export const EDIT_PROMPT = `${PROMPTSERVICEURL}/updatePrompt`
export const DELETE_PROMPT = `${PROMPTSERVICEURL}/deletePrompt`
export const FAVORITE_PROMPT = `${PROMPTSERVICEURL}/favoritePrompt`
export const COPY_PROMPT = `${PROMPTSERVICEURL}/trackCopy`

export const ANALYTICS_REPORT = `${ANALYTICSSERVICEURL}/getReport`
