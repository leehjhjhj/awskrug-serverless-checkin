

def make_html_body(event_name: str, hello_text: str | None) -> str:
    body_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ff9900 0%, #ffac33 100%); padding: 2px; border-radius: 8px;">
                        <div style="background-color: white; padding: 30px; border-radius: 6px;">
                            <h1 style="color: #ff9900; margin-top: 0; font-size: 24px;">{event_name} 출석 완료! 🎉</h1>
                            <p style="color: #444; font-size: 16px; line-height: 1.6;">
                                {hello_text}
                                <span style="color: #ff9900; font-weight: bold;">{event_name}</span>의 출석이 완료되었어요.<br>
                                찾아와주셔서 감사해요!
                            </p>
                            <div style="background-color: #fff9f0; padding: 10px; border-radius: 6px; border: 1px solid #ffe0b2; margin-top: 20px;">
                                <p style="color: #666; margin: 5px 0 0 0; text-align: center; font-size: 14px;">
                                    서버리스 소모임은 늘 열려있어요. <br>
                                    발표를 희망하시면 AWSKRUG 슬랙의 @hyunje로 DM주세요 😁
                                </p>
                            </div>
                            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; text-align: center;">
                                <p style="color: #666; font-size: 14px; margin: 0;">
                                    AWSKRUG 서버리스 소모임
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
    return body_html