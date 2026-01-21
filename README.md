# GTSA Photobooth

A Flask web application for capturing and compositing photos into a photostrip template during events.

## Features

- 📸 Real-time camera preview with multiple templates
- 🎨 Apply filters to photos (B&W, Sepia, Contrast+)
- 🖼️ 3-photo photostrip composition
- 📧 Email photostrips to users
- 💫 Flash effect and countdown timer
- 📱 Mobile-responsive design

## Local Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gtsa-photobooth.git
cd gtsa-photobooth
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

5. Run the app:
```bash
python app.py
```

Visit `http://localhost:5000`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to Render.

### Quick Deploy to Render

1. Push to GitHub
2. Go to https://render.com
3. Connect your repository
4. Configure environment variables
5. Deploy!

## Project Structure

```
├── app.py                 # Main Flask app
├── config.py             # Configuration
├── requirements.txt      # Python dependencies
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── template_select.html
│   ├── filters.html
│   ├── capture.html
│   ├── email.html
│   └── thanks.html
├── static/               # Static files
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript
│   ├── img/             # Images
│   └── photostrip_templates/  # Template images
```

## Configuration

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Create an [App Password](https://support.google.com/accounts/answer/185833)
3. Set in `.env`:
   - `MAIL_USERNAME`: your email
   - `MAIL_PASSWORD`: your app password

### Environment Variables

See `.env.example` for all available options.

## Usage Flow

1. **Home** → Select a photostrip template
2. **Filters** → Choose a filter and preview
3. **Capture** → Take 3 photos (countdown timer)
4. **Preview** → See the composed photostrip
5. **Email** → Enter email to receive the photostrip

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari with HTTPS

## Known Limitations

- Requires HTTPS on production (browser camera permission)
- Free Render tier has 15-minute inactivity timeout
- Camera access requires user permission

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
