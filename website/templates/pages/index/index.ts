import Clipboard from 'clipboard';

import '../../../main';
import '../../../main.css';
import './index.css';

// eslint-disable-next-line no-new
new Clipboard(document.getElementsByClassName('clipboard')[0]);
